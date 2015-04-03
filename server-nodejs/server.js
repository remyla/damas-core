var express = require('express'),
    bodyParser= require('body-parser');
var app = express();
  app.use(bodyParser.urlencoded({extended: true})),
  app.use(bodyParser.json());
  var routes = require('./routes/index');
app.use('/', routes);

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
;
