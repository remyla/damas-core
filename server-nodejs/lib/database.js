/*
 * database.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (type, settings) {
    this.debug = require('debug')('app:db:' + process.pid);
    this.debug('Specified database : ' + type);
    this.db = null;

    /*
     * Fill the current object using the prototype of the wanted database
     */
    switch (type) {
        case 'MongoDB':
            this.db = require('./db/mongodb')();
            break;
/*
        case 'mysql':
            this.prototype = require('./db/mysql');
            break;
        case 'redis':
            this.prototype = require('./db/redis');
            break;
        case 'gun':
            this.prototype = require('./db/gun');
            break;
*/
        case 'none':
        case 'debug':
        default:
            this.db = require('./db/debug')();
    }

    this.db.connect(settings, function (err, conn) {
        if (err) {
            this.debug('Error: could not connect to the database.');
            this.connected = false;
        }
    });

    /*this.connect = function (conf, callback) {
        return this.db.connect(conf, callback);
    };

    this.create = function (nodes, callback) {
        return this.db.create(nodes, callback);
    };

    this.read = function (ids, callback) {
        return this.db.read(ids, callback);
    };

    this.update = function (ids, keys, callback) {
        return this.db.update(ids, keys, callback);
    };

    this.remove = function (ids, callback) {
        return this.db.remove(ids, callback);
    };

    this.search = function (keys, callback) {
        return this.db.search(keys, callback);
    };*/

    return this.db;
}


