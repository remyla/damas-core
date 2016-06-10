/*
 * index.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

/*
 * Initialize Express
 */
var debug = require('debug')('app:' + process.pid);

debug('Initializing express');
var express = require('express');
var app = express();

/*
 * Configuration
 */
debug('Loading configuration');

var conf = app.locals.conf = require('./conf');
app.locals.db = require('./db')(conf.db, conf[conf.db]);

require('./routes')(app, express);


/*
 * Export the app if we are in a test environment
 */
if (module.parent) {
    module.exports = app;
    return;
}

debug('Working in %s mode', app.get('env'));

function startServer(type, port) {
    global.server = server;
    server.listen(port, function () {
        debug('%s server listening on port %s', type, port);
        var socket = require('./events/socket');
        socket.attach(server);
    });
}

/*
 * Create a HTTPS server if there are certificates
 * Create a HTTP server otherwise
 */
if (conf.connection && conf.connection.Key && conf.connection.Cert) {
    var fs = require('fs');
    var port = process.env.HTTPS_PORT || 8443;
    debug('Creating HTTPS server on port %s', port);
    global.server = require('https').createServer({
        key: fs.readFileSync(conf.connection.Key).toString(),
        cert: fs.readFileSync(conf.connection.Cert).toString()
    }, app);
    startServer('HTTPS', port);
} else {
    var port = process.env.HTTP_PORT || 8090;
    debug('Creating HTTP server on port %s', port);
    global.server = require('http').createServer(app);
    startServer('HTTPS', port);
}


