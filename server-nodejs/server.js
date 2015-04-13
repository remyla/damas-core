var express = require('express'),
    bodyParser= require('body-parser');
var app = express();
  app.use(bodyParser.urlencoded({extended: true})),
  app.use(bodyParser.json());

var https = require('https');
var http = require('http');
  var routes = require('./routes/index');
app.use('/', routes);

http.createServer(app).listen(8090);
https.createServer(app).listen(443);
console.log("Listening on ports 80 and 443");
