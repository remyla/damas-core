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
    db.collection('node', function(err, collection) {
      if (err)
        callback(err);
      else {
        collection.insert(keys, {safe:true}, function(err, result) {
          if (err)
            callback(err);
          else
            self.read(keys._id, callback);
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
      if (err)
        callback(err);
      else {
        collection.findOne({'_id':new ObjectId(id)},function(err, item) {
          if (err)
            callback(err);
          else
            callback(null, item);
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
    var keyToRemove = {};
    var keyToAdd = {};
    var keyToRemoveExist=false;
    var keyToAddExist=false;
    for(var k in keys){
      if(keys[k]===null){
        keyToRemove[k]='';
        keyToRemoveExist= true;
      }
      else{
        keyToAdd[k]=keys[k];
        keyToAddExist=true;
      }
    }
    var self= this;
    db.collection('node', function(err, collection) {
      if (err)
        callback(err);
      else {
        if(keyToAddExist)
          collection.updateOne({'_id':new ObjectId(id)}, {$set:keyToAdd}, function(err, result) {
            if (err)
              callback(err, null);
            else {
              if(keyToRemoveExist)
                collection.updateOne({'_id':new ObjectId(id)}, {$unset: keyToRemove}, function(err) {
                  if (err)
                    callback(err, null);
                  else
                    self.read(id, callback);
                });
              else
                self.read(id, callback);
            }
          });
        else if(keyToRemoveExist)
          collection.updateOne({'_id':new ObjectId(id)}, {$unset:keyToRemove}, function(err, result) {
            if (err)
              callback(err, null);
            else
            self.read(id, callback);
          });
      }
    });
  }

  /**
    * Recursively delete a node - WARNING: this function doesn't check anything before removal
    * @return {Boolean} true on success, false otherwise
  */
  this.deleteNode = function(id, callback) {
    db.collection('node', function(err, collection) {
      if (err)
        callback(err);
      else {
        collection.deleteMany({$or:[{'_id':new ObjectId(id)},{'tgt_id':id},{'src_id':id}]}, function(err, result) {
          if (err)
            callback(err, null);
          else{
            callback(null,result);}
        });
      }});
  }
};
