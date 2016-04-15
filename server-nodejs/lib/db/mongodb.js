/*
 * lib/db/mongodb.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

/*
 * Explicitly an object
 */
module.exports = function () {
    var self   = this;
    var mongo = require('mongodb');
    self.conn  = false;
    self.debug = require('debug')('app:db:mongo:' = process.pid);
    // TODO: recursion algorithms at a higher level
    // TODO: normalize the output to the callbacks
    // TODO: run tests...
    // On large collections, toArray() might be risky - everything is in memory
    // The DB managers don't have to know the structure of stored data

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
        db.open(function (err, conn) {
            if (err) {
                return callback(true);
            }
            self.debug('connected');
            self.conn = conn;
            self.collection = conf.collection;
            callback(false, conn);
        });
    };

    /**
     * Create nodes, without parent verification.
     * @param {array} nodes - Objects to create in the database
     * @param {function} callback - Callback function to routes.js
     */
    self.create = function(nodes, callback) {
        if (!self.conn) {
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
    };

    /**
     * Retrieve nodes as key->value objects.
     * @param {array} ids - Identifiers of the nodes to retrieve.
     * @param {function} callback - Callback function to routes.js
     */
    self.read = function (ids, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids) {
            ids = [ids];
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            coll.find({'_id':{$in:ids}}, function (err, results) {
                callback(err, err ? null : results.toArray());
            });
        }
    };

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
        if (!Array.isArray(ids) {
            ids = [ids];
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            var set = [], unset = [];
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
                self.debug(count + '/' + nodes.length + ' nodes updated');
            });
        });
    };

    /**
     * Delete specified nodes.
     * @param {array} ids - List of node ids to delete
     * @param {function} callback - Function callback to routes.js
     */
    self.deleteNode = function (ids, callback) {
        if (!self.conn) {
            return callback(true);
        }
        if (!Array.isArray(ids) {
            ids = [ids];
        }
        self.conn.collection(self.collection, function (err, coll) {
            if (err) {
                return callback(true);
            }
            collection.remove({'_id':{$in:ids}}, function (err, result) {
                if (err || result.result.n === 0) {
                    return callback(true);
                }
                callback(false, result);
            });
        });
    };

    /**
     * Search for nodes in the database.
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
            collection.find(keys,{"_id":true}, function (err, results) {
                callback(err, err ? null : results.toArray());
            });
        });
    };
};


