/*
 * lib/db/debug.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (conf) {
    var debug = require('debug')('app:db:debug:' + process.pid);
    this.conf = conf;

    this.connect = function (callback) {
        debug('Call to db.connect(). Current configuration:');
        debug(this.conf);
        callback(true);
    };

    this.create = function (nodes, callback) {
        debug('Call to db.create() with the following nodes:');
        debug(nodes);
        callback(true);
    };

    this.read = function (ids, callback) {
        debug('Call to db.read() with the following ids:');
        debug(ids);
        callback(true);
    };

    this.update = function (ids, keys, callback) {
        debug('Call to db.update() with the following elements:');
        debug('Update ids: ', ids);
        debug('Update keys: ', keys);
        callback(true);
    };

    this.remove = function (ids, callback) {
        debug('Call to db.delete() with the following ids:');
        debug(ids);
        callback(true);
    };

    this.search = function (keys, callback) {
        debug('Call to db.search() with the following keys:');
        debug(keys);
        callback(true);
    };
};


