module.exports= function Model() {

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Damas');
var nodeSchema;
var Nodes;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  nodeSchema = mongoose.Schema({
    type: String,
    node_id: Number,
    value: String
  });
  Nodes = mongoose.model('Nodes', nodeSchema);
});


this.search = function(req, res) {
  var result ='';
  Nodes.find(function(err, node) {
    if (err) return console.error(err);
    for(n in node)
      result=node[n]+'\r\n';
      res.send(result);
  })
};

this.searchBy = function(req, res) {
  var id = req.params.id;
  var by = req.params.by;
  console.log('Retrieving test: ' +by + id);
    switch(by){
      case 'name':
        Nodes.find({name:id}, function(err, item) {
      res.send(item);
    });
      break;
      case 'number':
        Nodes.find({number:id}, function(err, item) {
      res.send(item.name);
    });
      break;
      default:
        res.send('yo');
    }
};

this.update = function(req, res) {
  var id = req.params.id;
  var tests = req.body;
  console.log('Updating: ' + id);
  console.log(JSON.stringify(tests));
    Nodes.update({number:id}, tests, {multi:true}, function (err, numberAffected, raw) {
  if (err) console.log(err);
  console.log('The number of updated documents was %d', numberAffected);
  console.log('The raw response from Mongo was ', raw);
});
};

this.delete = function(req, res) {
  var id = req.params.id;
  console.log('Deleting: ' + id);
    Nodes.remove({number:id}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred - ' + err});
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
};

this.add = function(req, res) {
  var tests = req.body;
  console.log('Add: ' + JSON.stringify(tests));
    Nodes.create(tests, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        console.log('Success: ' + JSON.stringify(result));
        res.send(result[0]);
      }
    });
};


}
