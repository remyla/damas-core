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
  * @param {function} callback - Function callback to routes.js
  */

  this.create= function(keys, callback) {
    var self= this;
    console.log('Add: ' + JSON.stringify(keys));
    db.collection('node', function(err, collection) {
      if (err) {
        callback(err);
      }
      else {
        collection.insert(keys, {safe:true}, function(err, result) {
          if (err) {
            callback(err);
          } else {
            console.log('Success: ' + JSON.stringify(result));
            self.read(keys._id, callback);
          }
        });
      }
    });
  };

  /**
   * Get key->values combinations for a given node
   * @param {Integer} $id of the node
   * @return {JSON Object} key=value pairs
   */
   this.read= function(id,callback){
    db.collection('node', function(err, collection) {
      if (err) {
        console.log(err);
        callback(err);
      }
      else {
        collection.findOne({'_id':new ObjectId(id)},function(err, item) {
          if (err) {
            callback(err);
          }
          else callback(null, item);
        });
      }
    });
  };

  /**
   * Update the keys of a node. Specified keys overwrite existing keys, others are left untouched.
   * A null key value removes the key.
   * @param {Integer} $id node index
   * @param {Array} $keys keys Array of key/value pairs to update (usually comming from json_decode)
   * @param {function} callback - Function callback to routes.js
   */

   this.update = function(id, keys, callback) {
    console.log('Updating: ' + id);
    console.log(keys);
    var keyToRemove = {};
    var keyToAdd = {};
    var keyToRemoveNumber=0;
    var keyToAddNumber=0;
    for(var k in keys){
      if(keys[k]===null){
        keyToRemove[k]='';
        ++keyToRemoveNumber;
      }
      else{
        keyToAdd[k]=keys[k];
        ++keyToAddNumber;
      }
    }
    var self= this;
    db.collection('node', function(err, collection) {
      if (err) {
        console.log(err);
        callback(err);
      }
      else {
        if(keyToAddNumber>0)
          collection.updateOne({'_id':new ObjectId(id)}, {$set:keyToAdd}, {safe:true}, function(err, result) {
            if (err) {
              console.log('Error updating: ' + err);
              callback('error de update one '+err, null);
            }
            else {
              if(keyToRemoveNumber>0)
                collection.updateOne({'_id':new ObjectId(id)}, {$unset: keyToRemove}, {safe:true}, function(err) {
                  if (err) {
                    console.log('Error updating: ' + err);
                    callback('error de update one2 '+err, null);
                  } else {
                    console.log(keys+ " removed");
                    self.read(id, callback);
                  }
                });
              else
                self.read(id, callback);
            }
          });
        else if(keyToRemoveNumber>0)
          collection.updateOne({'_id':new ObjectId(id)}, {$unset:keyToRemove}, {safe:true}, function(err, result) {
            if (err) {
              console.log('Error updating: ' + err);
              callback(err, null);
            } else {
              callback(null,id);
            }
          });
      }
    });
  }

  /**
    * Recursively delete a node - WARNING: this function doesn't check anything before removal
    * @return {Boolean} true on success, false otherwise
  */
  this.deleteNode = function(id, callback) {
    console.log('Deleting: ' +id);
    db.collection('node', function(err, collection) {
      if (err) {
        console.log(err);
        callback(err);
      }
      else {
        console.log('Id '+id);
        collection.deleteMany({$or:[{'_id':new ObjectId(id)},{'tgt_id':id},{'src_id':id}]}, {safe:true}, function(err, result) {
          if (err) {
            callback(err, null);
          } else {
            console.log('' + result + ' document(s) deleted');
            callback(null,result);
          }
        });
      }});
  }

  /**
   * Remove a set of keys
   * @param {Integer} $id node id
   * @param {JSON Object} $name key name
   * @param {function} callback - Function callback to routes.js
   */
   this.removeKey= function(id, keys, callback){
    db.collection('node', function(err, collection) {
      if (err) {
        var msg_error = "Error " + err;
        console.log(msg_error);
        callback(msg_error);
        //throw err;
      }
      else {
        collection.update({'_id':new ObjectId(id)}, {$unset: keys}, {safe:true}, function(err, result) {
         if (err) {
          var msg_error = 'Error deleting: ' + err;
          console.log(msg_error);
          callback(msg_error);
          //throw err;
        } else {
          var msg_success = keys+ " removed";
          console.log(msg_success);
        }
      });
      }
    });
  }
};
