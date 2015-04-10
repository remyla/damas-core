module.exports= function Model() {

var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  ObjectId= mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('Node', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'Node' database");
    db.collection('node', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The collection doesn't exist. Creating it with sample data...");
        populateDB();
      }
    });
  }
});

this.find = function(req, res) {
  db.collection('node', function(err, collection) {
    collection.find({},{"name": 0}).toArray(function(err, items) {
      res.send(items);
    });
  });
};

this.searchById = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving test: ' + id);
  db.collection('node', function(err, collection) {
    collection.findOne({'number':id}, function(err, item) {
      res.send(item);
    });
  });
};

this.searchBy = function(req, res) {
  var id = req.params.id;
  var by = req.params.by;
  var act={};
  act[by]=id;
  db.collection('node', function(err, collection) {
        collection.findOne(act, function(err, item) {
      res.send(item);
  });
};

this.create = function(keys) {
  console.log('Add: ' + JSON.stringify(keys));
  db.collection('node', function(err, collection) {
    collection.insert(keys, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred'});
        return false;
      } else {
        console.log('Success: ' + JSON.stringify(result));
        return keys._id;
      }
    });
  });
}

this.update = function(id, keys) {
  console.log('Updating: ' + id);
  db.collection('node', function(err, collection) {
    collection.findAndModify({'_id':new ObjectId(id)}, {$set: keys}, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        for(var k in keys)
          if(keys[k]===null)
            this.removeKey(id, k);
      }
    });
  });
}

this.removeKey= function(id, key){
  console.log('Removing: '+ key +' From '+ id);
  var keyToRemove={};
  keyToRemove[key]="";
  db.collection('node', function(err, collection) {
    collection.update({'_id':new ObjectId(id)}, {$unset: keyToRemove}, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating: ' + err);
      } else {
        console.log('Key '+ key +' removed from '+id);
      }
    });
  });
}

this.delete = function(req, res) {
  var id = req.params.id;
  console.log('Deleting: ' + id);
  db.collection('nodes', function(err, collection) {
    collection.remove({'_id':id}, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred - ' + err});
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
  });
}
};
