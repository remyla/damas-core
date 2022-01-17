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
 * Retrieve nodes as key->value objects.
 * @param {array} ids - Identifiers of the nodes to retrieve.
 * @param {function} callback - Callback function to routes.js
 */
self.read = function (ids, callback) {
    self.getCollection(callback, function (coll) {
        var query = self.querify(ids);
        var idHash = {};
        ids = query.$or[0]._id.$in.concat(query.$or[1].file.$in);
        for (var i = 0; i < ids.length; ++i) {
            idHash[ids[i]] = i;
        }
        coll.find(query).toArray(function (err, nodes) {
            if (err) {
                return callback(true);
            }
            callback(false, nodes.reduce(function (res, node) {
                if ('undefined' !== typeof idHash[node._id.toString()]) {
                    res[idHash[node._id.toString()]] = node;
                } else {
                    res[idHash[node.file]] = node;
                }
                return res;
            }, ids.map(function () { return null; })));
        });
    });
}; // read()

/**
 * Put the id into an object, handling ObjectID and file
 * @param {array} ids - ids to put
 * @return {array} - the new array
 */
self.exportId = function (id) {
    if (/^[a-fA-F0-9]{24}$/.test(id) && ObjectID.isValid(id)) {
        return {_id: new ObjectID(id)};
    } else if ('string' !== typeof id) {
        return null;
    }
    if (-1 < id.indexOf('/')) {
        return {file: id};
    } else {
        return {_id: id};
    }
};

/**
 * Transform the ids into a Mongo query object
 * @param {array} ids - ids to process
 * @return {object} - Mongo query object
 */
self.querify = function (ids) {
    var ids_o = ids.map(self.exportId);
    var query = {$or: [{_id: {$in: []}}, {file: {$in: []}}]};

    for (var i = 0; i < ids_o.length; ++i) {
        var key = Object.keys(ids_o[i])[0];
        query.$or[key == '_id' ? 0 : 1][key].$in.push(ids_o[i][key]);
    }
    return query;
};


