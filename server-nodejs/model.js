var debug = require('debug')('app:model:mongo:' + process.pid);
var conf = require('./conf');
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;

module.exports = function Model()
{
	// Data about connection is in the file conf.json
	var dataMongo = conf.mongoDB;
	var self = this;
	var Server = mongo.Server;
	var Db = mongo.Db;
	var conn;

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
				console.log('error: could not connect to the specified MongoDB database');
				return callback( true );
			}
			debug('connected');
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
							//self.read( (keys._id).toString().split(","), callback );
							self.readOne( (keys._id).toString(), callback );
						}
					});
				}
			});
		}
	});
	}; //End Create

	/**
	 * Get key->values combinations for the given nodes
	 * @param {Integer} ids array of indexes
	 * @param {function} callback - Function callback to routes.js
	 */
	this.read = function( ids, callback )
	{
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
						function findnext(indexes, cursor){
							collection.findOne({'_id':new ObjectId(indexes[cursor])}, function(err, item) {
							if(cursor===indexes.length)
							{
								callback(false,array);
								return;
							}
							array.push(item);
							findnext(indexes, ++cursor);
							});
						}
						findnext(ids, 0);
					}
				});
			}
		});
	};

	/**
	 * Get a node specifying its index
	 * @param {string} id - index of the node to
	 * @param {function} callback - Function callback to routes.js
	 */
	this.readOne = function( id, callback )
	{
		this.connection( function(err, database )
		{
			if( err )
			{
				callback( true );
				return;
			}
			database.collection( dataMongo.collection, function(err, collection){
				if(err)
				{
					callback( true );
					return;
				}
				collection.findOne({'_id':new ObjectId(id)},function(err, item) {
					if (err)
					{
						callback(true);
						return;
					}
					callback(false,item);
				});
			});
		});
	};

	/**
	 * Update nodes keys. The specified keys overwrite existing keys, others are left untouched.
	 * A null key value removes the key.
	 * @param {array} id - array of node indexes to update
	 * @param {object} keys - hash containing key/value pairs
	 * @param {function} callback - function to call when done
	 */
	this.update = function( ids, keys, callback )
	{
		debug('update nodes: ', ids);
		debug('update keys: ', keys);
		var keysToUnset = {};
		var keysToSet = {};
		var toUpdate = {};
		// prepare ids
		var ids_o = new Array();
		for (var i = 0; i < ids.length; i++)
		{
			ids_o.push(new ObjectId(ids[i]));
		}
		for( var k in keys )
		{
			if( keys[k] === null )
			{
				keysToUnset[k] = '';
			}
			else
			{
				keysToSet[k] = decodeURIComponent(keys[k]);
			}
		}

		//Mongo >= 2.6 Update operators must specify a non-empty operand expression
		if (Object.keys(keysToSet).length > 0) {
			toUpdate.$set = keysToSet;
		}
		if (Object.keys(keysToUnset).length > 0) {
			toUpdate.$unset = keysToUnset;
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

						collection.update( { '_id': {$in:ids_o} }, toUpdate, {multi: true}, function( err, result)
						{
							if( err )
							{
								callback( true );
							}
							else
							{
								self.read( ids_o, callback );
							}
						});
					}
				});
			}
		});
	};

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
