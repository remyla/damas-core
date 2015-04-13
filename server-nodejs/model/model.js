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

this.update= function(id, keys, res) {
  console.log('Updating: ' + id);
  console.log(keys);
  var self= this;
  db.collection('node', function(err, collection) {
    collection.update({'_id':new ObjectId(id)}, {$set:keys}, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        for(var k in keys)
          if(keys[k]===null)
            self.removeKey(id, k);
      }
      res.send(id+" Updated")
    });
  });
}


this.deleteNode=function(id, res) {
  console.log('Deleting: ' + new ObjectId(id));
  db.collection('node', function(err, collection) {
    collection.remove({$or:[{'_id':new ObjectId(id)},{'tgt_id':id},{'src_id':id}]}, {safe:true}, function(err, result) {
      if (err) {
        res.send("error");
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(result+ " documents deleted");
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
