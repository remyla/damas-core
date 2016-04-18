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
        case 'MongoDB':
            db = require('./db/mongodb')();
            break;
        default:
            db = require('./db/debug')();
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


