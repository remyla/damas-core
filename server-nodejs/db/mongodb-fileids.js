/*
 * lib/db/mongodb-fileids.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

var self = new (require('./mongodb'))({});

module.exports = function (conf) {
    self.conf = conf;
    return self;
}

var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
require('./utils');

/**
 * Update nodes. Existing values are overwritten, null removes the key.
 * @param {array} ids - Identifiers of the nodes to update
 * @param {object} keys - New keys to define on the nodes
 * @param {function} callback - Callback function to routes.js
 */
self.update = function (nodes, callback) {
    self.getCollection(callback, function (coll) {
        array_sync(nodes, function (node, cb) {
            // Get the ids
            node._id = Array.isArray(node._id) ? node._id : [node._id];
            var ids = self.exportIds(node._id);
            var query = {$or: [{_id: {$in: []}}, {file: {$in: []}}]};
            for (var i = 0; i < ids.length; ++i) {
                var key = Object.keys(ids[i])[0];
                query.$or[key == '_id' ? 0 : 1][key].$in.push(ids[i][key]);
            }
            if (node.file) {
                node._id = node.file;
            }

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
            coll.update(query, up, {multi: true}, function (err, stat) {
                if (err) {
                    return cb(null);
                }
                self.read(node._id, function (err, doc) {
                    cb(err ? null : doc);
                });
            });
        }, function (array) {
            callback(false, array);
            fireEvent('update', array);
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
        array_sync(self.exportIds(ids), function (id, cb) {
            coll.remove(id, function (err, result) {
                if (err || 0 === result.result.n) {
                    return cb(null);
                }
                cb(id._id || id.file);
            });
        }, function (array) {
            callback(false, array);
            fireEvent('remove', array);
        });
    });
}; // remove()

/**
 * Put all ids into a new array, handling ObjectID and file
 * @param {array} ids - ids to put
 * @return {array} - the new array
 */
self.exportIds = function (ids) {
    return (Array.isArray(ids) ? ids : [ids]).map(function (id) {
        if (ObjectID.isValid(id)) {
            return {_id: new ObjectID(id)};
        } else if ('string' !== typeof id) {
            return;
        }
        if (-1 < id.indexOf('/')) {
            return {file: id};
        } else {
            return {_id: id};
        }
    });
}

