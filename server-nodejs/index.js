/*
 * index.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

/*
 * Initialize required modules
 */
var debug = require('debug')('app:' + process.pid);

debug('Initializing express');
var express = require('express');
var app     = express();
var fs      = require('fs');
var http    = require('http');
var https   = require('https')

/*
 * Configuration
 */
debug('Loading configuration');
var conf = app.locals.conf = require('./conf.json');

var Database = require('./lib/database.js');
var db = app.locals.db = new Database(conf.db, conf[conf.db]);

var http_port  = process.env.HTTP_PORT  || 8090;
var https_port = process.env.HTTPS_PORT || 8443;

require('./routes/index')(app, express);

/*
 * We are not in a test environment, start a server
 */
if (!module.parent) {
    /*
     * Create an HTTP server
     */
    debug('Working in %s mode', app.get('env'));
    debug('Creating HTTP server on port %s', http_port);
    http.createServer(app).listen(http_port, function () {
        debug('HTTP server listening on port %s', http_port);
    });

    /*
     * Create an HTTP server if there are certificates
     */
    if (conf.connection.hasOwnProperty('Key') &&
            conf.connection.hasOwnProperty('Cert')) {
        debug('Creating HTTPS server on port %s', https_port);
        https.createServer({
            key:  fs.readFileSync(conf.connection.Key),
            cert: fs.readFileSync(conf.connection.Cert)
        }, app).listen(https_port, function () {
            debug('HTTPS server listening on port %s', https_port);
        });
    }
} else {
    /*
     * We are in a test environment, export the app
     */
    module.exports = app;
}
