/*
 * server-nodejs/db/mongodb6.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

// SPECIFICATION BREAKING CHANGES (to add in documentation) :
// - create() method now returns identifier(s) and not entire object(s)

var async = require('async');

module.exports = function (conf) {
    var self = this;
    self.conf = conf;
    self.db = false;
    self.debug = require('debug')('app:db:mongo:' + process.pid);
    const { MongoClient } = require('mongodb');
    self.client = new MongoClient(conf.host+':'+conf.port, conf.options);
    var ObjectID = require('mongodb').ObjectId;
    require('./utils');

    /*
     * Initialize the connection.
     * @param {object} conf - Database settings
     * @param {function} callback - Callback function to routes.js
     */
    self.connect = function (callback) {
        if (self.db) {
            callback(false, self.db);
            return;
        }
        var conf = self.conf;
        self.client.connect().then(
                res => {
                    console.log('Connected successfully to server');
                    self.db = self.client.db(self.conf.db);
                    callback(false, self.db);
                },
                err => {
                    console.log(err);
                    self.debug('Unable to connect to the MongoDB database');
                    callback(true);
                }
        );
    }; // connect()

    /*
     * Load the collection
     * @param {function} route - Callback function in case of failure
     * @param {function} callback - Function needing the collection
     */
    self.getCollection = function (route, callback) {
        self.connect(function (err, db) {
            if (err || !db) {
                route(true);
                return;
            }
            callback(self.db.collection(self.conf.collection));
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
                coll.insertOne(node).then(
                    res => {
                        next(null, res.insertedId);
                    },
                    err => {
                        next(null, null);
                    }
                );
            }
            async.mapLimit(nodes, 100, createNode, function (err, array) {
                fireEvent('create', array);
                callback(false, array);
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
            coll.find(query).toArray().then(
                nodes => {
                    callback(false, nodes.reduce(function (res, node) {
                        var id = node._id.toString();
                        for (var i = 0; i < idHash[id].length; ++i) {
                            res[idHash[id][i]] = node;
                        }
                        return res;
                    }, ids.map(function () { return null; })));
                },
                err => {
                    self.debug('Error: find on mongo collection returned an error. '+err);
                    return callback(true);
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
                coll.updateOne(query, up).then(
                    res => {
                        next(null, query[Object.keys(query)[0]]);
                        //next(null, res.upsertedId); // another way to get the id
                    },
                    err => {
                        next(null, '');
                    });
            }
            async.mapLimit(nodes, 100, updateNode, function (err, ids) {
                self.read(ids, function (err, doc) {
                    fireEvent('update', doc);
                    callback(false, doc);
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
            function deleteNode(obj, next) {
                coll.deleteOne(obj).then(
                    res => {
                        next(null, res.deletedCount === 1? obj._id: null);
                    },
                    err => {
                        next(null, null);
                    });
            }
            async.mapLimit(ids.map(self.exportId), 100, deleteNode, function (err, array) {
                fireEvent('remove', array);
                callback(false, array);
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
            coll.find(keys, {_id: true}).toArray().then(
                res => {
                    var ids = [];
                    for (r in res) {
                        ids.push(res[r]._id.toString());
                    }
                    callback(false, ids);
                },
                err => {
                    callback(true);
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
            coll.find({tgt_id: {$in: ids}}).toArray().then(
                res => {
                    for (var r in res) {
                        if (undefined == links[res[r]._id]) {
                            if (res[r].src_id != undefined) {
                                if (0 > ids.indexOf(res[r].src_id)) {
                                    newIds.push(res[r].src_id);
                                }
                            }
                            links[res[r]._id] = res[r];
                        }
                    }
                    if (--depth === 0 || newIds.length < 1) {
                        callback(false, links);
                    } else {
                        self.links_r(newIds, depth, links, callback);
                    }
                },
                err => {
                    callback(true);
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
            var total = coll.countDocuments(query).then(
                total => {
                    var cur = coll.find(query, { _id: 1 } );
                    var find = cur.sort(sort).skip(skip).limit(limit);
                    find.toArray().then(
                        res => {
                            var ids = [];
                            for (r in res) {
                                ids.push(res[r]._id.toString());
                            }
                            callback(false, { count: total, ids: ids } );
                        },
                        err => {
                            callback(true);
                        });
                },
                err=> {
                    callback(true);
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
};


