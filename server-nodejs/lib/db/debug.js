var debug = require('debug')('app:db:mongo:' + process.pid);
var conf = require('./conf');
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;

/*
 * Explicitly an object
 */
module.exports = function () {
    var self = this;
    self.debug = require('debug')('app:db:debug:' + process.pid);

    self.connect = function (conf, callback) {
        debug('Call to db.connect() with the following configuration:');
        debug(conf);
        callback(true);
    };

    self.createNodes = function (nodes, callback) {
        debug('Call to db.create() with the following nodes:');
        debug(nodes);
        callback(true);
    };

    self.readNodes = function (ids, callback) {
        debug('Call to db.read() with the following ids:');
        debug(ids);
        callback(true);
    };

    self.updateNodes = function (ids, keys, callback) {
        debug('Call to db.update() with the following elements:');
        debug('Update ids: ', ids);
        debug('Update keys: ', keys);
        callback(true);
    };

    self.removeNodes = function (ids, callback) {
        debug('Call to db.delete() with the following ids:');
        debug(ids);
        callback(true);
    };

    self.searchNodes = function (keys, callback) {
        debug('Call to db.search() with the following keys:');
        debug(keys);
        callback(true);
    };

    return self;
};


