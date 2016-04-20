/*
 * lib/db/mongodb.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (conf) {
    var self   = this;
    self.conf  = conf;
    self.conn  = false;
    self.collection = false;
    self.debug = require('debug')('app:db:mongo:' + process.pid);

    var mongo = require('mongodb');
    var ObjectID = mongo.ObjectID;

    // TODO: normalize the output to the callbacks (error code?)
    // TODO: run tests...
    // TODO: make sure we get an id array when searching
    // TODO: verify input and output types of every function
    // TODO: make sure every function supports arrays (eg, search with $in)

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
        var conf   = self.conf;
        var server = new mongo.Server(conf.host, conf.port, conf.options);
        var db     = new mongo.Db(conf.collection, server);
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
     * @param {function} callback - Callback function to routes.js
     */
    self.create = function(nodes, callback) {
        self.getCollection(callback, function (coll) {
            coll.insert(nodes, {'safe': true}, function (err, result) {
                if (err) {
                    callback(true);
                    return;
                }
                // result.ops = array containing all nodes
                if (result.ops.length === 1) {
                    // One element inserted, return one element
                    callback(false, result.ops[0]);
                } else if (result.ops.length > 1) {
                    // An array was inserted, return an array
                    callback(false, result.ops);
                } else {
                    // Nothing was inserted
                    callback(true);
                }
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
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            for (var i in ids) {
                ids[i] = new ObjectID(ids[i]);
            }
            var array = [];
            function findNext(pos) {
                if (pos === ids.length) {
                    callback(false, array);
                    return;
                }
                coll.findOne({'_id': ids[pos]}, function (err, node) {
                    if (!err) {
                        array.push(node);
                        findNext(++pos);
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
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            for (var i in ids) {
                ids[i] = new ObjectID(ids[i]);
            }
            var params = {};
            for (var k in keys) {
                if (keys[k] === null) {
                    if (undefined === params.$unset) {
                        params.$unset = {};
                    }
                    params.$unset[k] = '';
                } else {
                    if (undefined === params.$set) {
                        params.$set = {};
                    }
                    params.$set[k] = keys[k];
                }
            }
            coll.update({'_id':{$in:ids}}, params, {multi: true},
                        function (err, status) {
                if (err) {
                    callback(true);
                }
                self.debug('Update status: ' + status);
                self.read(ids, function (err, nodes) {
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
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            for (var i in ids) {
                ids[i] = new ObjectID(ids[i]);
            }
            coll.remove({'_id':{$in:ids}}, function (err, result) {
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
                    ids.push(results[r]._id).toString();
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
            coll.find({'tgt_id':{$in:ids}}).toArray(function (err, results) {
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
            for (l in links) {
                if (undefined != links[l].src_id) {
                    if (0 > ids.indexOf(links[l].src_id)) {
                        ids.push(links[l].src_id);
                    }
                }
            }
            self.read(ids, function(error, nodes) {
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


