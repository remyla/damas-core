var debug = require('debug')('app:db:mongo:' + process.pid);
var conf = require('./conf');
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;

/*
 * Explicitly an object
 */
module.exports = function () {
    var self = this;

    self.connect = function (conf, callback) {
        debug('Call to db.connect() with the following configuration:');
        debug(conf);
    };

    self.create = function (nodes, callback) {
        debug('Call to db.create() with the following nodes:');
        debug(nodes);
    };

    self.read = function (ids, callback) {
        debug('Call to db.read() with the following ids:');
        debug(ids);
    };

    self.update = function (ids, keys, callback) {
        debug('Call to db.update() with the following elements:');
        debug('Update ids: ', ids);
        debug('Update keys: ', keys);
    };

    self.delete = function (ids, callback) {
        debug('Call to db.delete() with the following ids:');
        debug(ids);
    };

    self.search = function (keys, callback) {
        debug('Call to db.search() with the following keys:');
        debug(keys);
    };
};


