var http     = require('http'), 
	https    = require('https'),
	express  = require('express'),
	app      = express(),
	fs		 = require('fs'),
	conf 	 = require('./conf.json'),
	bodyParser = require('body-parser'),
	routes = require('./route')(app);

// //Middlewares
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());


var confConn = conf.connection;

//Options for https connection 
var options = {
	key  : fs.readFileSync(confConn.pathKey + confConn.keyFile),
	cert : fs.readFileSync(confConn.pathKey + confConn.cerFile)
};

//Creation server http & https
var serverhttp  = http.createServer(app).listen(confConn.portHttp);
    serverhttps = https.createServer(options, app).listen(confConn.portHttps);