var http = require('http'),
https = require('https'),
express = require('express'),
app = express(),
fs = require('fs'),
conf = require('./conf.json');

var router = express.Router();
router.use(require('./controllers/dam'));
app.use(router);

var routes = require('./routes')(app, express);

//Shortcut conf json
var confConn = conf.connection;

//Setting for determine if is a test envoronment
if( !module.parent )
{
	//Creation server http
	var serverhttp  = http.createServer(app).listen(confConn.portHttp);
	if(confConn.hasOwnProperty('keyFile') && confConn.hasOwnProperty('cerFile'))
	{
		//Options for https connection
		var options = {
			key : fs.readFileSync(confConn.keyFile),
			cert : fs.readFileSync(confConn.cerFile)
		};
		//Creation server https
		var serverhttps = https.createServer(options, app).listen(confConn.portHttps); 
	}
}
//test environment
else
{
	module.exports = app;
}
