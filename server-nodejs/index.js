var http = require('http'),
https = require('https'),
express = require('express'),
app = express(),
fs = require('fs'),
conf = require('./conf.json'),
routes = require('./routes')(app);

//Shortcut conf json
var confConn = conf.connection;

//Options for https connection

var options = {
	key : fs.readFileSync(confConn.pathKey + confConn.keyFile),
	cert : fs.readFileSync(confConn.pathKey + confConn.cerFile)
};

//Setting for determine if is a test envoronment
if( !module.parent )
{
//Creation server http & https
	var serverhttp  = http.createServer(app).listen(confConn.portHttp);
	var serverhttps = https.createServer(options, app).listen(confConn.portHttps); //definir la variable, espacios, no vars globales, callback true o false, no espacios en al var = nsad
}
//test environment
else
{
	module.exports = app;
}