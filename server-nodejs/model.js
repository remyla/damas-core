var mongo = require('mongodb'),
conf = require('./conf');

module.exports = function Model()
{
	// Data about connection is in the file conf.json
	var dataMongo = conf.mongoDB,
	self = this,
	Server = mongo.Server,
	Db = mongo.Db,
	ObjectId = mongo.ObjectID,
	conn;

	//START: --------------MONGODB--------------
	this.connection = function(callback)
	{
		//console.log(this);
		//Check if there is an active connection to db
		if(conn)
		{
			callback( false, conn );
			return;
		}
		server = new Server( dataMongo.host, dataMongo.port, dataMongo.options ),
		db = new Db( dataMongo.collection, server );
		db.open(function(err, databaseConnection)
		{
			if(err)
			{
				return callback( true );
			}
			console.log('connected');
			conn = databaseConnection;
			callback( false, databaseConnection );
		});
	}
	//END: ----------------MONGODB--------------

	/**
	 * Creates a node providing its internal type value. Doesn't check parent node existence.
	 * @param {JSON Object} JSON Object containing the values of the fields to create for this node
	 * @param {function} callback - Function callback to routes.js
	 */

	this.create = function( keys, callback )
	{
		var self = this;
		this.connection( function( err, database )
		{
			if( err )
			{
				callback( true );
			}
			else
			{
			//console.log('Add: ' + JSON.stringify(keys));
			database.collection( dataMongo.collection, function( err, collection )
			{
				if( err )
				{
					callback( true );
				}
				else
				{

					//START FOLDER MANAGEMENT
					if(keys.file != undefined){
						var path= keys.file;
						path=path.replace(/\/[^\/]*$/,"");
						self.createFolder(path,collection,self);
					}
					//END FOLDER MANAGEMENT
					if (keys.tgt_id != undefined){
						keys.tgt_id = new ObjectId(keys.tgt_id);
					}
					if (keys.src_id != undefined){
						keys.src_id = new ObjectId(keys.src_id);
					}
					collection.insert( keys, {safe:true}, function( err, records )
					{
						if( err )
						{
							callback( true );
						}
						else
						{
						//console.log('Success: ' + JSON.stringify(records));
						if(keys.file != undefined){
							self.createFolder((keys.file).replace(/\/[^\/]*$/,""),collection,self);
						}
						self.read( keys._id, callback );
						}
					});
				}
			});
		}
	});
	}; //End Create

	/**
	 * Get key->values combinations for a given node
	 * @param {Integer} $id of the node
	 * @param {function} callback - Function callback to routes.js
	 */
	this.read = function( id, callback )
	{
	//console.log('ok');
		this.connection( function(err, database )
		{
			if( err )
			{
				callback( true );
			}
			else
			{
				database.collection(dataMongo.collection, function(err, collection)
				{
					if(err)
					{
						callback( true );
					}
					else
					{
						collection.findOne({'_id': new ObjectId(id)}, function(err,item)
						{
							if(err)
							{
								callback( true );
							}
							else
							{
								if( item == null)
								{
									return callback( true )
								}
								else
								{
									callback( false, item );
								}
							}
						});
					}
				});
			}
		});
	}; //End read

	/**
	 * Update the keys of a node. Specified keys overwrite existing keys, others are left untouched.
	 * A null key value removes the key.
	 * @param {Integer} $id node index
	 * @param {Array} $keys keys Array of key/value pairs to update (usually comming from json_decode)
	 * @param {function} callback - Function callback to routes.js
	 */
	this.update = function( id, keys, callback )
	{
		var self=this;
		var keyToRemove = {},
		keyToAdd = {},
		hasKeyToRemove = false,
		hasKeyToAdd = false;

		for( var k in keys )
		{
			if( keys[k] === null )
			{
				keyToRemove[k] = '';
				hasKeyToRemove = true;
			}
			else
			{
				keyToAdd[k] = keys[k];
				hasKeyToAdd = true;
			}
		}
		this.connection( function(err, database )
		{
			if( err )
			{
				callback(true);
			}
			else
			{
				database.collection( dataMongo.collection, function( err, collection )
				{
					if( err )
					{
						callback( true );
					}
					else
					{
						if(keys.file != undefined){
							self.createFolder((keys.file).replace(/\/[^\/]*$/,""),collection,self);
							collection.findOne({'_id': new ObjectId(id)},{"_id":0,"file":1}, function(err,item)
							{
								if(err)
								{
									callback( true );
								}
								else
								{
									if( item == null)
									{
										return callback( true )
									}
									else
									{
										self.removeFolder((item.file).replace(/\/[^\/]*$/,""), collection, self);
									}
								}
							});
						}
						if( hasKeyToAdd && hasKeyToRemove )
						{
							collection.updateOne( {'_id':new ObjectId( id )}, {$set:keyToAdd, $unset:keyToRemove}, function( err, result)
							{
								if( err )
								{
									callback( true );
								}
								else
								{
									self.read( id, callback );
								}
							});
						}
						else if( hasKeyToAdd )
						{
							collection.updateOne( {'_id':new ObjectId(id)}, {$set:keyToAdd}, function( err, result )
							{
								if( err )
								{
									callback( true );
								}
								else
								{
									self.read( id, callback );
								}
							});
						}
						else if( hasKeyToRemove )
						{
							collection.updateOne({'_id':new ObjectId(id)}, {$unset:keyToRemove}, function(err, result)
							{
								if( err )
								{
									callback( true );
								}
								else
								{
									self.read( id, callback );
								}
							});
						}
					}
				});
			}
		});
	}; //End update

	/**
	 * Recursively delete a node - WARNING: this function doesn't check anything before removal
	 * @param {Integer} $id node index
	 * @param {function} callback - Function callback to routes.js
	 */
	this.deleteNode = function( id, callback )
	{
		var self= this;
		this.connection( function(err, database )
		{
			if( err )
			{
				callback(true);
			}
			else
			{
				database.collection( dataMongo.collection, function( err, collection)
				{
					if( err )
					{
						callback( true );
					}
					else {
						collection.findOne({'_id': new ObjectId(id)},{"_id":0,"file":1}, function(err,item)
						{
							if(err)
							{
								callback( true );
							}
							else
							{
								if( item == null)
								{
									return callback( true )
								}
								else
								{
									self.removeFolder((item.file).replace(/\/[^\/]*$/,""), collection, self);
								}
							}
						});
						collection.remove( {$or:[ {'_id':new ObjectId(id)}, {'tgt_id':id},{'src_id':id}] }, function( err, result )
						{
							if( err )
							{
								callback( true );
							}
							else
							{
								var res = result.result.n;
								if(res === 0)
								{
									return callback( true );
								}
								else
								{
									callback( false, result );
								}
							}
						});
					}
				});
			}
		});
	}; //End deleteNode

	this.search=function(keys, callback){
		this.connection( function(err, database )
		{
			if( err )
			{
				callback(true);
			}
			else
			{
				database.collection(dataMongo.collection, function(err, collection) {
					if (err)
						callback(true);
					else {
						collection.find(keys,{"_id":1}).toArray(function(err, results) {
							if (err)
								callback(true);
							else{
								var ids=[];
								for(r in results)
									ids.push(results[r]._id);
								callback(false, ids);
							}
						});
					}
				});
			}
		});
	};

	this.getSubdirs=function(path, callback){
		var pattern= new RegExp("^"+path+"\/[^\/]*$");
		this.connection( function(err, database )
		{
			if( err )
			{
				callback(true);
			}
			else
			{
				database.collection(dataMongo.collection, function(err, collection) {
					if (err)
						callback(true);
					else {
						collection.distinct("file",{"file":{$regex:pattern}},function(err, results) {
							if (err)
								callback(true);
							else{
								callback(false, results);
							}
						});
					}
				});
			}
		});
	};

	this.links_r=function(ids, links, database, callback){
		var newIds=[];
		var self= this;
		if(links==null)
			links=[];
		database.collection(dataMongo.collection, function(err, collection) {
			if (err)
				callback(true);
			else {
				collection.find({'src_id':{$in:ids}}).toArray(function(err, results) {
					if (err)
						callback(true);
					else{
						for(r in results){
							if(links[results[r]._id]==undefined){
								if(ids.indexOf(results[r].tgt_id)<0 && (results[r].tgt_id)!=undefined)
									newIds.push(results[r].tgt_id);
								links[results[r]._id]=results[r];
							}
						}
						if(newIds.length<1)
							callback(false, links);
						else
							self.links_r(newIds, links, database, callback);
					}
				});
			}
		});
	};

	this.nodes=function(ids, database, callback){
		var array=[];
		database.collection(dataMongo.collection, function(err, collection) {
			if (err)
				callback(true);
			else {
				for(i in ids){
					collection.findOne({'_id':new ObjectId(ids[i])},function(err, item) {
						if (err)
							callback(true);
						else{
							array.push(item);
							if(ids.length == array.length)
								callback(false,array);
							}
					});
				}
			}
		});
	}

	this.graph= function(id, callback){
		var ids=[];
		var self= this;
		if (typeof(id) === "string"){
			id = new ObjectId(id);
		}
		ids.push(id);
		this.connection( function(err, database )
		{
			if( err )
			{
				callback(true);
			}
			else
			{
				self.links_r(ids,null , database, function(error, links){
					if(error){
						callback(true);
					}
					else if (links){
						ids.length=0;
						ids.push(id);
						for(l in links){
							if(links[l].tgt_id!=undefined){
								if(ids.indexOf(links[l].tgt_id)<0)
									ids.push(links[l].tgt_id);
								}
							}
						self.nodes(ids, database, function(error, nodes){
							if(error){
								callback(true);
							}
							else if(nodes){
								for(l in links)
									nodes.push(links[l]);
								var result=links.concat(nodes);
								callback(false,nodes);
							}
							else
								callback(true);
						});
					}
					else
						callback(true);
				});
			}
		});
	};

//SUBDIRECTORIES CREATION AND DELETION

this.createFolder=function(path, collection,self){
	collection.find({file:path}).toArray(function(err, rec)
	{
		if(err){
			callback (true);}
		else{
				if(rec.length===0)
					{
						collection.insert({file:path}, function(err){
							path=path.replace(/\/[^\/]*$/,"");
							if(path)
									self.createFolder(path, collection,self);});
					}
					return;
		}
	});
};

this.removeFolder=function(path, collection,self){
	collection.find({file:{$regex: new RegExp("^"+path+"/")}}).toArray(function(err, rec)
	{
		if(err){
			callback (true);}
		else{
				if(rec.length===0)
					{
						collection.remove({file:path}, function(err){
							path=path.replace(/\/[^\/]*$/,"");
							if(path)
									self.removeFolder(path, collection,self);});
					}
					return;
		}
	});
};

};
/*
ids.length=0;
ids.push(id);
for(l in links){
	if(links[l].tgt_id!=undefined){
		if(ids.indexOf(links[l].tgt_id)<0)
			ids.push(links[l].tgt_id);
		}
	}
*/
