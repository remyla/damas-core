/*
 * index.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

/*
 * Initialize Express
 */
//var debug = require('debug')('app:' + process.pid);
var debug = require('debug')('damas');

debug('Initializing express');
var express = require('express');
var app = express();

/*
 * Configuration
 */
debug('Loading configuration');

var conf = app.locals.conf = require('./conf');
app.locals.db = require('./db')(conf.db, conf[conf.db]);

var bodyParser = require( 'body-parser' );
app.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );
app.use( bodyParser.json({limit: '50mb', strict: false}));

var morgan = require('morgan');
app.use(morgan('dev'));

/*
 * Extensions
 */
debug('Loading extensions');
var debug = require('debug')('damas:extensions');
app.locals.extensions = [];
for(extname in conf.extensions) {
    if (false === conf.extensions[extname].enable){
        continue;
    }
    debug('loading ' + extname);
    if (conf.extensions[extname].conf) {
        if ('string' === typeof conf.extensions[extname].conf)
            app.locals.conf[extname] = require(conf.extensions[extname].conf);
        if ('object' === typeof conf.extensions[extname].conf)
            app.locals.conf[extname] = conf.extensions[extname].conf;
    }
    var extobj = require(conf.extensions[extname].path);
    if ('function' === typeof extobj) {
        app.locals.extensions[extname] = extobj(app, express);
    }
}
var debug = require('debug')('damas');
debug('Extensions loaded');

require('./routes')(app, express);

/*
 * Export the app if we are in a test environment
 */
if (module.parent) {
    module.exports = app;
    return;
}

debug('Working in %s mode', app.get('env'));
var socket = require('./events/socket');

/*
 * Create a HTTP server
 */
var http_port = process.env.HTTP_PORT || 8090;
debug('Creating HTTP server on port %s', http_port);
var http = require('http').createServer(app).listen(http_port, function () {
    debug('HTTP server listening on port %s', http_port);
    socket.attach(http);
});

/*
 * Create a HTTPS server if there are certificates
 */
if (conf.https.enable) {
    var fs = require('fs');
    var https_port = process.env.HTTPS_PORT || 8443;
    debug('Creating HTTPS server on port %s', https_port);
    var https = require('https').createServer({
        key: fs.readFileSync(conf.https.key).toString(),
        cert: fs.readFileSync(conf.https.cert).toString()
    }, app).listen(https_port, function () {
        debug('HTTPS server listening on port %s', https_port);
        socket.attach(https);
    });
}

/*
 * Listen signals to gracefully close HTTP and HTTPS server
 */
process.on('SIGINT', stopall);
process.on('SIGTERM', stopall);

function stopall() {
    debug('Closing HTTP server');
    http.close(function () {
        debug('HTTP server closed');
        if (conf.https.enable) {
            debug('Closing HTTPS server');
            https.close(function () {
                debug('HTTPS server closed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
}


