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
}