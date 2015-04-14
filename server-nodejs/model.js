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

/**
  * Creates a node providing its internal type value. Doesn't check parent node existence.
  * @param {JSON Object} JSON Object containing the values of the fields to create for this node
  */
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

/**
 * Remove a set of keys
 * @param {Integer} $id node id
 * @param {JSON Object} $name key name
 */
this.removeKey= function(id, keys){
  db.collection('node', function(err, collection) {
    collection.update({'_id':new ObjectId(id)}, {$unset: keys}, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating: ' + err);
      } else {
        console.log(keys+ " removed");
      }
    });
  });
}


/**
 * Update the keys of a node. Specified keys overwrite existing keys, others are left untouched.
 * A null key value removes the key.
 * @param {Integer} $id node index
 * @param {Array} $keys keys Array of key/value pairs to update (usually comming from json_decode)
 */
this.update= function(id, keys, res) {
  console.log('Updating: ' + id);
  console.log(keys);
  var keyToRemove = {};
  var self= this;
  var keyNumber=0;
  db.collection('node', function(err, collection) {
    collection.update({'_id':new ObjectId(id)}, {$set:keys}, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        for(var k in keys)
          if(keys[k]===null){
            keyToRemove[k]='';
            ++keyNumber;
          }
          if(keyNumber>0)
            self.removeKey(id, keyToRemove);
      }
      res.send(id+" Updated")
    });
  });
}

/**
  * Recursively delete a node - WARNING: this function doesn't check anything before removal
  * @return {Boolean} true on success, false otherwise
  */
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

/**
 * Get key->values combinations for a given node
 * @param {Integer} $id of the node
 * @return {JSON Object} key=value pairs
 */
this.read= function(id,res){
  db.collection('node', function(err, collection) {
    collection.findOne({'_id':new ObjectId(id)},function(err, item) {
      res.json(item);
    });
  });
}

};
