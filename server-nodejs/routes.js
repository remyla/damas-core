module.exports = function(app){
	var mongo = require( 'mongodb' ),
	mongoModel = require( './model.js' ),
	bodyParser = require( 'body-parser' ),
	methodOverride = require( 'method-override' ),
	ObjectId = mongo.ObjectID;
	mod = new mongoModel(),
	morgan= require('morgan');

	//Middlewares
-	app.use(morgan('combined'));
	app.use( bodyParser.urlencoded( { extended : true } ) );
	app.use( bodyParser.json() );

	app.use(methodOverride( function(req, res)
	{
		if ( req.body && typeof req.body === 'object' && '_method' in req.body )
		{
			// look in urlencoded POST bodies and delete it
			var method = req.body._method;
			delete req.body._method;
			return method;
		}
	}));

	//Handle errors
	app.use( function(err, req, res, next)
	{
		if( err )
		{
			console.log("An error has occurred: "+ err);
		}
		else
		{
			next();
		}
	});

	/* CRUD operations */
	create = function( req, res )
	{
		var obj_keys = Object.keys( req.body ),
		keys = req.body;
		//Empty keys
		if( obj_keys === '' || !obj_keys || obj_keys.length === 0)
		{
			res.status(400);
			res.send('Bad command');
		}
		else
		{
			//Invalid JSON
			if(!isValidJson( (keys) ))
			{
				res.status(409);
				res.send('create Error, please change your values');
			}

			//Correct Format - keys
			else
			{
				mod.create(keys, function(error, doc)
				{
					if( error )
					{
						res.status(409);
						res.send('create Error, please change your values');
					}
					else
					{
						res.status(201);
						res.send(doc);
					}
				});
			}
		}
	};

	read = function( req,res )
	{
		var id;
		if( req.params.id )
		{
			id = req.params.id;
		}
		else if( req.body.id )
		{
			id = req.body.id;
		}
		if( !id || id=="undefined" )
		{
			res.status(400);
			res.send('Bad command');
		}
		else
		{
			if( !ObjectId.isValid( id ) )
			{
				res.status(404);
				res.send('Id not found');
			}
			else
			{
				mod.read( id, function( error, doc )
				{
					if( error )
					{
						res.status(409);
						res.send('Read Error, please change your values');
					}
					else
					{
						res.status(200);
						res.send(doc);
					}
				});
			}
		}
	};

	update = function( req, res )
	{
		var id,
		keys = req.body;

		if( req.params.id )
		{
			id = req.params.id;
		}
		else if( keys.id )
		{
			id = keys.id;
			delete keys.id;
		}
		if( Object.keys( keys ).length === 0 || id === "undefined" )
		{
			res.status(400);
			res.send('Bad command');
		}
		else
		{
			if(! ObjectId.isValid( id ))
			{
				res.status(404);
				res.send('Id not found');
			}
			else
			{
				mod.update(id, keys, function(error, doc)
				{
					if( error )
					{
						res.status(409);
						res.send('Update Error, please change your values');
					}
					else
					{
						res.json( doc );
					}
				});
			}
		}
	};

	deleteNode = function(req, res)
	{
		var id;
		if( req.params.id )
		{
			id = req.params.id;
		}
		else if( req.body.id )
		{
			id = req.body.id;
		}
		if(! ObjectId.isValid( id ) || !id)
		{
			res.status(400);
			res.send("Bad command");
		}
		else
		{
			mod.deleteNode(id, function( error, doc )
			{
				if( error )
				{
					res.status(409);
					res.send('delete Error, please change your values');
				}
				else
				{
					res.status(200);
					res.send(doc.result.n + " documents deleted.");
				}
			});
		}
	};

graph = function(req,res) {
		var ids=[];
		var nodeIds=[];
		var id= req.params.id;
		ids.push(id);
		mod.links_r(ids,null ,function(error, links){
			if(error){
				res.status(404).send('Id not found');
			}
			else if (error==null && links){
				nodeIds[id]=id;
				for(l in links){
					if(links[l].tgt_id!=undefined){
						nodeIds[(links[l].tgt_id)]=links[l].tgt_id;
						nodeIds.length ++;
						}
					}
				mod.nodes(nodeIds, function(error, nodes){
					if(error){
						res.status(404).send('Id not found');
					}
					else if(nodes){
						for(l in links)
							nodes.push(links[l]);
						var result=links.concat(nodes);
						res.json(nodes);
					}
					else
						res.status(404).send('Id not found');
				});
			}
			else
				res.status(404).send('Id not found');
		});
	};

	/**
	 * Check if an object is a valid json
	 * @param {JSON Object} JSON Object containing the keys - values
	 * @return {boolean} true if is valid, false otherwise
	 */
	isValidJson = function( keys )
	{
		for( var val in keys )
		{
			var y;
			if( Object.prototype.hasOwnProperty.call( keys,  val ) )
			{
				y = keys[val];
				if(y = '' || y=== null || y==='')
				{
					return false;
				}
			}
		}
		return true;
	}

	app.get('/graph/:id', graph);
	app.get('/:id', read);
	app.get('/', read);
	app.post('/', create);
	app.put('/:id', update);
	app.put('/', update);
	app.delete('/:id', deleteNode);
	app.delete('/', deleteNode);
}
