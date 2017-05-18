/*
 * lib/db/mongodb.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

var async = require('async');

module.exports = function (conf) {
    var self = this;
    self.conf = conf;
    self.conn = false;
    self.collection = false;
    self.debug = require('debug')('app:db:mongo:' + process.pid);

    var mongo = require('mongodb');
    var ObjectID = mongo.ObjectID;
    require('./utils');

    /*
     * Initialize the connection.
     * @param {object} conf - Database settings
     * @param {function} callback - Callback function to routes.js
     */
    self.connect = function (callback) {
        if (self.conn) {
            callback(false, self.conn);
            return;
        }
        var conf = self.conf;
        var server = new mongo.Server(conf.host, conf.port, conf.options);
        var db = new mongo.Db(conf.collection, server);
        db.open(function (err, connection) {
            if (err) {
                self.debug('Unable to connect to the MongoDB database');
                callback(true);
                return;
            }
            self.debug('Connected to the database');
            self.conn = connection;
            self.collection = conf.collection;
            callback(false, self.conn);
        });
    }; // connect()

    /*
     * Load the collection
     * @param {function} route - Callback function in case of failure
     * @param {function} callback - Function needing the collection
     */
    self.getCollection = function (route, callback) {
        self.connect(function (err, conn) {
            if (err || !conn) {
                route(true);
                return;
            }
            self.conn.collection(self.collection, function (err, coll) {
                if (err || !coll) {
                    self.debug('Error: unable to load the collection');
                    route(true);
                    return;
                }
                callback(coll);
            });
        });
    };


    /*
     * Minimal CRUDS operations
     */


    /**
     * Create nodes, without parent verification.
     * @param {array} nodes - Objects to create in the database
     * @param {function} callback - function({boolean} err, {array} nodes)
     */
    self.create = function (nodes, callback) {
        self.getCollection(callback, function (coll) {
            function createNode(node, next) {
                if (node._id) {
                    node = Object.assign(node, self.exportId(node._id));
                }
                coll.insert(node, {safe: true}, function (err, result) {
                    next(null, err ? null : result.ops[0]);
                });
            }
            async.mapLimit(nodes, 100, createNode, function (err, array) {
                callback(false, array);
                fireEvent('create', array);
            });
        });
    }; // create()

    /**
     * Retrieve nodes as key->value objects.
     * @param {array} ids - Identifiers of the nodes to retrieve.
     * @param {function} callback - Callback function to routes.js
     */
    self.read = function (ids, callback) {
        self.getCollection(callback, function (coll) {
            var query = self.querify(ids);
            var idHash = {};
            for (var i = 0; i < ids.length; ++i) {
                if (Array.isArray(idHash[ids[i]])) {
                    idHash[ids[i]].push(i);
                } else {
                    idHash[ids[i]] = [i];
                }
            }
            coll.find(query).toArray(function (err, nodes) {
                if (err) {
                    return callback(true);
                }
                callback(false, nodes.reduce(function (res, node) {
                    var id = node._id.toString();
                    for (var i = 0; i < idHash[id].length; ++i) {
                        res[idHash[id][i]] = node;
                    }
                    return res;
                }, ids.map(function () { return null; })));
            });
        });
    }; // read()

    /**
     * Update nodes. Existing values are overwritten, null removes the key.
     * @param {array} ids - Identifiers of the nodes to update
     * @param {object} keys - New keys to define on the nodes
     * @param {function} callback - Callback function to routes.js
     */
    self.update = function (nodes, callback) {
        self.getCollection(callback, function (coll) {
            function updateNode(node, next) {
                var query = self.exportId(node._id);

                // Separate operations
                var up = {$set: {}, $unset: {}};
                for (var k in node) {
                    if (k !== '_id') {
                        var op = (node[k] === null) ? '$unset' : '$set';
                        up[op][k] = node[k];
                    }
                }
                if (0 === Object.keys(up.$set).length) {
                    delete up.$set;
                }
                if (0 === Object.keys(up.$unset).length) {
                    delete up.$unset;
                }
                coll.update(query, up, function (err, stat) {
                    var id = query[Object.keys(query)[0]];
                    next(null, err ? '' : id);
                });
            }
            async.mapLimit(nodes, 100, updateNode, function (err, ids) {
                self.read(ids, function (err, doc) {
                    callback(false, doc);
                    fireEvent('update', doc);
                });
            });
        });
    }; // update()

    /**
     * Delete specified nodes.
     * @param {array} ids - List of node ids to delete
     * @param {function} callback - Callback function to routes.js
     */
    self.remove = function (ids, callback) {
        self.getCollection(callback, function (coll) {
            function deleteNode(id, next) {
                coll.remove(id, function (err, result) {
                    if (err || 0 === result.result.n) {
                        next(null, null);
                    } else {
                        next(null, id[Object.keys(id)[0]]);
                    }
                });
            }
            async.mapLimit(ids.map(self.exportId), 100, deleteNode,
                    function (err, array) {
                callback(false, array);
                fireEvent('remove', array);
            });
        });
    }; // remove()

    /**
     * Search for nodes ids in the database.
     * @param {object} keys - Keys to find
     * @param {function} callback - Callback function to routes.js
     */
    self.search = function (keys, callback) {
        self.getCollection(callback, function (coll) {
            coll.find(keys, {_id: true}).toArray(function (err, results) {
                if (err) {
                    callback(true);
                    return;
                }
                var ids = [];
                for (r in results) {
                    ids.push(results[r]._id.toString());
                }
                callback(false, ids);
            });
        });
    }; // search()

    self.searchFromText = function (str, callback) {
        self.search(textSearch2MongoQuery(str), callback);
    };

    /*
     * Higher-level functions
     */

    self.links_r = function (ids, depth, links, callback) {
        var newIds = [];
        var self = this;
        self.getCollection(callback, function (coll) {
            coll.find({tgt_id: {$in: ids}}).toArray(function (err, results) {
                if (err) {
                    callback(true);
                    return;
                }
                for (var r in results) {
                    if (undefined == links[results[r]._id]) {
                        if (results[r].src_id != undefined) {
                            if (0 > ids.indexOf(results[r].src_id)) {
                                newIds.push(results[r].src_id);
                            }
                        }
                        links[results[r]._id] = results[r];
                    }
                }
                if (--depth === 0 || newIds.length < 1) {
                    callback(false, links);
                } else {
                    self.links_r(newIds, depth, links, callback);
                }
            });
        });
    }; // links_r()


    /**
     * Retrieve the graph of the specified target nodes
     * @param {Array} ids - Array of node indexes
     * @param {Function} callback - function (err, result) to call
     */
    this.graph = function (ids, depth, callback){
        self.links_r(ids, depth, [], function (err, links) {
            if (err || !links) {
                callback(true);
                return;
            }
            var n_ids = ids;
            for (l in links) {
                if (undefined != links[l].src_id) {
                    if (0 > n_ids.indexOf(links[l].src_id)) {
                        n_ids.push(links[l].src_id);
                    }
                }
            }
            self.read(n_ids, function (error, nodes) {
                if (error || !nodes) {
                    callback(true);
                    return;
                }
                for (var l in links) {
                    nodes.push(links[l]);
                }
                callback(false, nodes);
            });
        });
    }; // graph()


    /*
     * MongoDB-specific functions
     */


    /**
     * Search for nodes ids in the database.
     * @param {object} query - Keys to find (with optional regexes)
     * @param {string} sort - Key used to sort the results
     * @param {integer} skip - Pagination: number of results to skip
     * @param {integer} limit - Pagination: max number of results to return
     * @param {function} callback - error bool and result object as parameter
     */
    self.mongo_search = function (query, sort, skip, limit, callback) {
        self.getCollection(callback, function (coll) {
            var cur = coll.find(query);
            var total = cur.count(function(err,count){
                var find = cur.sort(sort).skip(skip).limit(limit);
                find.toArray(function (err, results) {
                    if (err) {
                        callback(true);
                        return;
                    }
                    var ids = [];
                    for (r in results) {
                        ids.push(results[r]._id.toString());
                    }
                    callback(false, { count: count, ids: ids } );
                });
            });
        });
    }; // mongo_search()

    /**
     * Transform the ids into a Mongo query object
     * @param {array} ids - ids to process
     * @return {object} - Mongo query object
     */
    self.querify = function (ids) {
        var ids_o = ids.map(self.exportId);
        var query = {_id: {$in: []}};
        for (var i = 0; i < ids_o.length; ++i) {
            query._id.$in.push(ids_o[i]._id);
        }
        return query;
    }

    /**
     * Put the id into an object, handling ObjectID
     * @param {array} ids - ids to put
     * @return {array} - the new array
     */
    self.exportId = function (id) {
        if (/^[a-fA-F0-9]{24}$/.test(id) && ObjectID.isValid(id)) {
            return {_id: new ObjectID(id)};
        } else if ('string' === typeof id) {
            return {_id: id};
        }
        return null;
    }

    function textSearch2MongoQuery( str ) {
        var terms = str.split(' ');
        var pair;
        var result = {};
        for (var i = 0; i < terms.length; i++) {
            if (terms[i].indexOf('<=') > 0) {
                pair = terms[i].split('<=');
                result[pair[0]] = {$lte: pair[1]};
                continue;
            }
            if (terms[i].indexOf('<') > 0) {
                pair = terms[i].split('<');
                result[pair[0]] = {$lt: pair[1]};
                continue;
            }
            if (terms[i].indexOf('>=') > 0) {
                pair = terms[i].split('>=');
                result[pair[0]] = {$gte: pair[1]};
                continue;
            }
            if (terms[i].indexOf('>') > 0) {
                pair = terms[i].split('>');
                result[pair[0]] = {$gt: pair[1]};
                continue;
            }
            if (terms[i].indexOf(':') > 0) {
                pair = terms[i].split(':');
                var value = pair[1];

                var flags = value.replace(/.*\/([gimy]*)$/, '$1');
                var pattern = value.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                if (flags != value && pattern != value) {
                    var regex = new RegExp(pattern, flags);
                    result[pair[0]] = regex;
                } else {
                    result[pair[0]] = value;
                }
                continue;
            }
        }
        return result;
    }
/* implement full text search
            result['$where'] = function () {
                for (var key in this) {
                    if (this[key])
                }
            }
db.things.find({$where: function () {
  for (var key in this) {
    if (this[key] === 'bar') {
      return true;
    }
    return false;
    }
}});
*/

};


