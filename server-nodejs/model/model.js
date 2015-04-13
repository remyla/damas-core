module.exports= function Model() {

var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  ObjectId= mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('node', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'Node' database");
    db.collection('node', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The collection doesn't exist.");
      }
    });
  }
});

this.create= function(keys) {
  console.log('Add: ' + JSON.stringify(keys));
  db.collection('node', function(err, collection) {
    collection.insert(keys, {safe:true}, function(err, result) {
      if (err) {
        console.log('error: An error has occurred');
      } else {
        console.log('Success: ' + JSON.stringify(result));
      }
    });
  });
}

function update(id, keys) {
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

function removeKey(id, key){
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

function deleteNode(req, res) {
  var id = req.params.id;
  console.log('Deleting: ' + id);
  db.collection('nodes', function(err, collection) {
    collection.remove({$or:[{'_id':new ObjectId(id)},{'tgt_id':id},{'src_id':id},{'node_id':id}]}, {safe:true}, function(err, result) {
      if (err) {
        return false;
      } else {
        console.log('' + result + ' document(s) deleted');
        return true;
      }
    });
  });
}

this.read= function(id,res){
  db.collection('node', function(err, collection) {
    collection.findOne({'_id':new ObjectId(id)},function(err, item) {
      res.json(item);
    });
  });
}

};
