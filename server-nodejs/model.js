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
					collection.insert( keys, {safe:true}, function( err, records )
					{
						if( err )
						{
							callback( true );
						}
						else
						{
						//console.log('Success: ' + JSON.stringify(records));
						self.read( (keys._id).toString().split(","), callback );
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
							var array=[];
							for(i in id){
								collection.findOne({'_id':new ObjectId(id[i])},function(err, item) {
									if (err)
										callback(true);
									else{
										array.push(item);
										if(id.length == array.length)
											callback(false,array);
										}
								});
							}
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
		var keyToRemove = {},
		keyToAdd = {},
		hasKeyToRemove = false,
		hasKeyToAdd = false;
		var ids=[];
		ids.push(id);
		console.log(arguments);

		for( var k in keys )
		{
			if( keys[k] === null )
			{
				keyToRemove[k] = '';
				hasKeyToRemove = true;
			}
			else
			{
				keyToAdd[k] = decodeURIComponent(keys[k]);
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
									self.read( ids, callback );
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
									self.read( ids, callback );
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
									self.read( ids, callback );
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
		console.log("keys=");
		console.log(keys);
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
									ids.push((results[r]._id).toString());
								callback(false, ids);
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
				collection.find({'tgt_id':{$in:ids}}).toArray(function(err, results) {
					if (err)
						callback(true);
					else{
						for(r in results){
							if(links[results[r]._id]==undefined){
								if(ids.indexOf(results[r].src_id)<0 && (results[r].src_id)!=undefined)
									newIds.push(results[r].src_id);
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

	/**
	 * Retrieve the graph for the specified nodes
	 * @param {Array} ids - Array of node indexes
	 * @param {Function} callback - function(err, result) to call
	 */
	this.graph = function(ids, callback){
		this.connection( function(err, database )
		{
			if (err)
			{
				callback(true);
				return;
			}
			self.links_r(ids, null, database, function(error, links){
				if (error)
				{
					callback(true);
					return;
				}
				if (!links)
				{
					callback(true);
					return;
				}
				var graph_indexes = ids;
				for(l in links){
					if (links[l].src_id != undefined)
					{
						if (graph_indexes.indexOf(links[l].src_id) < 0)
							graph_indexes.push(links[l].src_id);
					}
				}
				self.read(graph_indexes, function(error, nodes){
					if (error)
					{
						callback(true);
						return;
					}
					if (!nodes)
					{
						callback(true);
						return;
					}
					for(l in links)
						nodes.push(links[l]);
					var result = links.concat(nodes);
					callback(false, nodes);
				});
			});
		});
	};
};
