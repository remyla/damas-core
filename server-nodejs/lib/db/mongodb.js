/*
 * lib/db/mongodb.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function () {
    var self   = this;
    var mongo = require('mongodb');
    var ObjectID = mongo.ObjectID;
    self.conn  = false;
    self.collection = false;
    self.debug = require('debug')('app:db:mongo:' + process.pid);
    // TODO: normalize the output to the callbacks (error code?)
    // TODO: run tests...
    // TODO: make sure we get an id array when searching
    // TODO: verify input and output types of every function
    // TODO: make sure every function supports arrays (eg, search with $in)
    // TODO: check ObjectID compatibility everywhere...

    /*
     * Initialize the connection.
     * @param {object} conf - Database settings
     * @param {function} callback - Callback function to routes.js
     */
    self.connect = function (conf, callback) {
        if (self.conn) {
            return callback(false, self.conn);
        }
        var server = new mongo.Server(conf.host, conf.port, conf.options);
        var db     = new mongo.Db(conf.collection, server);
        db.open(function (err, connection) {
            if (err) {
                self.debug('Unable to connect to the MongoDB database');
                return callback(true);
            }
            self.debug('Connected to the database');
            self.conn = connection;
            self.collection = conf.collection;
            callback(false, self.conn);
        });
    }; // connect()


    /*
     * Minimal CRUDS operations
     */


    /**
     * Create nodes, without parent verification.
     * @param {array} nodes - Objects to create in the database
     * @param {function} callback - Callback function to routes.js
     */
    self.create = function(nodes, callback) {
        if (!self.conn) {
            self.debug('Error: not connected to the database');
            return callback(true);
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            /*
             * MongoDB actually supports inserting one document
             * or multiple documents at the same time.
             */
            coll.insert(nodes, {safe: true}, function (err, result) {
                callback(err, err ? null : result);
            });
        });
    }; // create()

    /**
     * Retrieve nodes as key->value objects.
     * @param {array} ids - Identifiers of the nodes to retrieve.
     * @param {function} callback - Callback function to routes.js
     */
    self.read = function (ids, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        for (var i in ids) {
            ids[i] = new ObjectID(ids[i]);
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            coll.find({'_id':{$in:ids}}).toArray(function (err, results) {
                callback(err, err ? null : results);
            });
        });
    }; // read()

    /**
     * Update nodes. Existing values are overwritten, null removes the key.
     * @param {array} ids - Identifiers of the nodes to update
     * @param {object} keys - New keys to define on the nodes
     * @param {function} callback - Callback function to routes.js
     */
    self.update = function (ids, keys, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        for (var i in ids) {
            ids[i] = new ObjectID(ids[i]);
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            var set = [];
            var unset = [];
            for (var k in keys) {
                if (keys[k] === null) {
                    unset[k] = '';
                } else {
                    set[k] = keys[k];
                }
            }
            coll.update({'_id':{$in:ids}}, {$set: set, $unset: unset},
                        {'multi': true}, function (err, count, status) {
                callback(err, err ? null : status);
                self.debug(count + '/' + ids.length + ' nodes updated');
            });
        });
    }; // update()

    /**
     * Delete specified nodes.
     * @param {array} ids - List of node ids to delete
     * @param {function} callback - Function callback to routes.js
     */
    self.remove = function (ids, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        for (var i in ids) {
            ids[i] = new ObjectID(ids[i]);
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            coll.remove({'_id':{$in:ids}}, function (err, result) {
                if (err || result.result.n === 0) {
                    return callback(true);
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
        if (!self.conn) {
            return callback(true);
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            coll.find(keys, {'_id':true}).toArray(function (err, results) {
                if (err) {
                    return callback(true);
                }
                var ids = [];
                for (r in results) {
                    ids.push(results[r]._id).toString();
                }
                callback(false, ids);
            });
        });
    }; // search()


    /*
     * Higher-level functions
     */

    self.links_r = function(ids, nIds, callback) {
        self.conn.collection(self.collection, function (err, coll) {
            coll.find({'tgt_id':{$in:ids}}).toArray(function (err, results) {
                nIds = [];
                if (err) {
                    return callback(true);
                }
                for (var r in results) {
                    if (undefined !== results[r].src_id) {
                        if (0 > ids.indexOf(results[r].src_id)) {
                            ids.push(results[r].src_id);
                            nIds.push(results[r].src_id);
                        }
                    }
                    if (0 > ids.indexOf(results[r]._id)) {
                        ids.push(results[r]._id);
                    }
                }
                if (nIds.length > 0) {
                    self.links_r(ids, nIds, callback);
                } else {
                    callback(false, ids);
                }
            });
        });
    };

    self.graph = function(ids, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        var newIds = ids;
        self.links_r(ids, newIds, function (err, lids) {
            if (err) {
                return callback(true);
            }
            self.read(lids, function (error, nodes) {
                if (error || !nodes) {
                    return callback(true);
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
        if (!self.conn) {
            return callback(true);
        }
        function prepare_regexes(obj) {
            for (var key in obj) {
                if (!key) {
                    continue;
                }
                if ('object' === typeof obj[key] && null !== obj[key]) {
                    prepare_regexes(obj[key]);
                    continue;
                }
                if ('string' === typeof obj[key]) {
                    if (obj[key].indexOf('REGEX_') === 0) {
                        obj[key] = new RegExp(obj[key].replace('REGEX_',''));
                    }
                }
            }
        }
        prepare_regexes(query);
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            var find = coll.find(query).sort(sort).skip(skip).limit(limit);
            find.toArray(function (err, results) {
                if (err) {
                    return callback(true);
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
    self.deleteNode = function (ids, callback) {
        return self.remove(ids, callback);
    }; // deleteNode()
};


