var debug = require('debug')('app:' + process.pid);

debug("Initializing express");
var express = require('express');
var app = express();

var fs = require('fs');
var conf = require('./conf.json');

var http = require('http');
var https = require('https')

var http_port = process.env.HTTP_PORT || 8090;
var https_port = process.env.HTTPS_PORT || 8443;

var morgan = require('morgan');
app.use(morgan('dev'));

var router = express.Router();

if (conf.auth === 'jwt')
{
	router.use(require('./routes/auth-node-jwt.js'));
	debug("Authentification is JWT");
}
else {
	router.use(require('./routes/auth-none.js'));
	debug("Warning: No authentication. Edit conf.json and set auth=jwt to enable json web tokens");
}

router.use(require('./routes/dam'));

app.use(router);

//var routes = require('./routes')(app, express);
var routes = require('./routes/default')(app, express);

// not in a test environment
if( !module.parent )
{
	debug('Creating HTTP server on port %s', http_port);
	http.createServer(app).listen(http_port, function(){
		debug('HTTP server listening on port %s in %s mode', http_port, app.get('env'));
	});
	if(conf.connection.hasOwnProperty('Key') && conf.connection.hasOwnProperty('Cert'))
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
