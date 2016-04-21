/*
 * lib/db/mongodb.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (conf) {
    var self = this;
    self.conf = conf;
    self.conn = false;
    self.collection = false;
    self.debug = require('debug')('app:db:mongo:' + process.pid);

    var mongo = require('mongodb');
    var ObjectID = mongo.ObjectID;

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
     * @param {array} nodes - Objects to insert into the database
     * @param {function} callback - Callback function to routes.js
     */
    self.create = function(nodes, callback) {
        self.getCollection(callback, function (coll) {
            coll.insert(nodes, {'safe': true}, function (err, result) {
                if (err) {
                    callback(true);
                    return;
                }
                callback(false, result.ops);
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
            var ids_o = [];
            for (var i in ids) {
                ids_o[i] = new ObjectID(ids[i]);
            }
            var array = [];
            function findNext(cursor) {
                if (cursor === ids_o.length) {
                    callback(false, array);
                    return;
                }
                coll.findOne({'_id': ids_o[cursor]}, function (err, node) {
                    if (!err) {
                        array.push(node);
                        findNext(++cursor);
                    }
                });
            }
            findNext(0);
        });
    }; // read()

    /**
     * Update nodes. Existing values are overwritten, null removes the key.
     * @param {array} ids - Identifiers of the nodes to update
     * @param {object} keys - New keys to define on the nodes
     * @param {function} callback - Callback function to routes.js
     */
    self.update = function (ids, keys, callback) {
        self.getCollection(callback, function (coll) {
            var ids_o = [];
            for (var i in ids) {
                ids_o[i] = new ObjectID(ids[i]);
            }
            var keysToUnset = {};
            var keysToSet = {};
            var toUpdate = {};

            for (var k in keys) {
                if (keys[k] === null) {
                    keysToUnset[k] = '';
                } else {
                    keysToSet[k] = decodeURIComponent(keys[k]);
                }
            }
            if (Object.keys(keysToSet).length > 0) {
                toUpdate.$set = keysToSet;
            }
            if (Object.keys(keysToUnset).length > 0) {
                toUpdate.$unset = keysToUnset;
            }
            coll.update({'_id': {$in: ids_o}}, toUpdate, {multi: true},
                        function (err, status) {
                if (err) {
                    callback(true);
                }
                self.debug('Update status: ' + status);
                self.read(ids_o, function (err, nodes) {
                    callback(err, err ? null : nodes);
                });
            });
        });
    }; // update()

    /**
     * Delete specified nodes.
     * @param {array} ids - List of node ids to delete
     * @param {function} callback - Function callback to routes.js
     */
    self.remove = function (ids, callback) {
        self.getCollection(callback, function (coll) {
            var ids_o = [];
            for (var i in ids) {
                ids_o[i] = new ObjectID(ids[i]);
            }
            coll.remove({'_id': {$in: ids_o}}, function (err, result) {
                if (err || result.result.n === 0) {
                    callback(true);
                    return;
                }
                callback(false, result);
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
            coll.find(keys, {'_id':true}).toArray(function (err, results) {
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


    /*
     * Higher-level functions
     */

    self.links_r = function (ids, links, callback) {
        var newIds = [];
        var self = this;
        if (links==null) {
            links=[];
        }
        self.getCollection(callback, function (coll) {
            coll.find({'tgt_id': {$in: ids}}).toArray(function (err, results) {
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
                if (newIds.length < 1) {
                    callback(false, links);
                } else {
                    self.links_r(newIds, links, callback);
                }
            });
        });
    }; // links_r()

    /**
     * Retrieve the graph of the specified target nodes
     * @param {Array} ids - Array of node indexes
     * @param {Function} callback - function(err, result) to call
     */
    this.graph = function(ids, callback){
        self.links_r(ids, null, function (err, links) {
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
            self.read(n_ids, function(error, nodes) {
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
     * @param {function} callback - Callback function to routes.js
     */
    self.mongo_search = function (query, sort, skip, limit, callback) {
        self.getCollection(callback, function (coll) {
            var find = coll.find(query).sort(sort).skip(skip).limit(limit);
            find.toArray(function (err, results) {
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
    }; // mongo_search()

    // Compatibility
    // As deleteNode() can actually delete multiple nodes
    self.deleteNode = function (ids, callback) {
        self.remove(ids, callback);
    }; // deleteNode()
};


