/*
 * index.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

/*
 * Initialize required modules
 */
var debug = require('debug')('app:' + process.pid);
debug("Initializing express");
var express = require('express');
var app     = express();
var fs      = require('fs');
var http    = require('http');
var https   = require('https')

/*
 * Mongo model
 */
var mongoModel = require('../model.js');
app.locals.mod = new mongoModel();
app.locals.mod.connection(function () { });
var mod = app.locals.mod;

/*
 * Configuration
 */
app.locals.conf = require('./conf.json');
var conf = app.locals.conf;
var http_port = process.env.HTTP_PORT   || 8090;
var https_port = process.env.HTTPS_PORT || 8443;

require('./routes/index')(app, express);

// not in a test environment
if (!module.parent)
{
	debug('Creating HTTP server on port %s', http_port);
	http.createServer(app).listen(http_port, function(){
		debug('HTTP server listening on port %s in %s mode', http_port, app.get('env'));
	});
	if (conf.connection.hasOwnProperty('Key') && conf.connection.hasOwnProperty('Cert'))
	{
		debug('Creating HTTPS server on port %s', https_port);
		https.createServer({
			key : fs.readFileSync(conf.connection.Key),
			cert : fs.readFileSync(conf.connection.Cert)

		}, app).listen(https_port, function(){
			debug('HTTPS server listening on port %s in %s mode', https_port, app.get('env'));
		}); 
	}
}
// test environment
else
{
	module.exports = app;
}
