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
    case 'mongodb6':
        var dbClass = require('./mongodb6');
        db = new dbClass(settings);
        break;
    case 'mongodb':
        var dbClass = require('./mongodb');
        db = new dbClass(settings);
        break;
    case 'mongodb-fileids':
        var dbClass = require('./mongodb-fileids');
        db = dbClass(settings);
        break;
    default:
        var dbClass = require('./debug');
        db = new dbClass(settings);
    }

    /*
     * Initialize the database object
     */
    db.connect(function (err) {
        if (err) {
            debug('Error: could not connect to the database.');
        }
    });

    return db;
}


