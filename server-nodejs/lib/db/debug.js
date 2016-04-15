/*
 * lib/db/debug.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function () {
    var self = this;
    self.debug = require('debug')('app:db:debug:' + process.pid);

    self.connect = function (conf, callback) {
        debug('Call to db.connect() with the following configuration:');
        debug(conf);
        callback(true);
    };

    self.create = function (nodes, callback) {
        debug('Call to db.create() with the following nodes:');
        debug(nodes);
        callback(true);
    };

    self.read = function (ids, callback) {
        debug('Call to db.read() with the following ids:');
        debug(ids);
        callback(true);
    };

    self.update = function (ids, keys, callback) {
        debug('Call to db.update() with the following elements:');
        debug('Update ids: ', ids);
        debug('Update keys: ', keys);
        callback(true);
    };

    self.remove = function (ids, callback) {
        debug('Call to db.delete() with the following ids:');
        debug(ids);
        callback(true);
    };

    self.search = function (keys, callback) {
        debug('Call to db.search() with the following keys:');
        debug(keys);
        callback(true);
    };

    return self;
};


