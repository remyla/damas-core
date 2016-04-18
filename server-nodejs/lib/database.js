/*
 * database.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (type, settings) {
    var debug = require('debug')('app:db:' + process.pid);
    debug('Specified database : ' + type);
    var db = null;

    /*
     * Choose the database to instantiate
     */
    switch (type) {
        case 'mongodb':
            var dbClass = require('./db/mongodb');
            db = new dbClass();
            break;
        default:
            var dbClass = require('./db/debug');
            db = new dbClass();
    }

    /*
     * Initialize the database object
     */
    db.connect(settings, function (err, conn) {
        if (err) {
            debug('Error: could not connect to the database.');
        }
    });

    return db;
}


