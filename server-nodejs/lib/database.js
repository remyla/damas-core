/*
 * database.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (type, settings) {
    this.debug = require('debug')('app:db:' + type + ':' + process.pid);
    this.debug('Specified database : ' + type);

    /*
     * Fill the current object using the prototype of the wanted database
     */
    switch (type) {
        case 'mongodb':
            this.prototype = require('./db/mongodb');
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
            this.prototype = require('./db/debug');
    }

    this.connect(settings, function (err, conn) {
        if (err) {
            this.debug('Error: could not connect to the database.');
            this.connected = false;
        }
    });
    return this;
}


