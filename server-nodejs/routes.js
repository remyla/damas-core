module.exports = function(app, express){
	var mongo = require( 'mongodb' ),
	mongoModel = require( './model.js' ),
	bodyParser = require( 'body-parser' ),
	methodOverride = require( 'method-override' ),
	conf = require( './conf.json' ),
	fs  = require('fs'),
	multer  = require('multer'),
	ncp= require('ncp').ncp;
	ObjectId = mongo.ObjectID;
	mod = new mongoModel(),
	mkdirp= require('mkdirp'),
	crypto= require('crypto'),

	mod.connection( function(){});
	morgan= require('morgan');

	ncp.limit=16;
	var checksum;
	var done=false;
	var tempFile;
	var fileSystem=conf.fileSystem;
	//Middlewares
	app.use(morgan('combined'));
	app.use( bodyParser.json({limit: '50mb'}));
	app.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );

	app.use(multer({
	onError: function (error, next) {
		console.log(error);
		next(error);
	},
	onFileUploadStart: function (file) {
		done=false;
		checksum= crypto.createHash('sha1');
	},
	onFileUploadComplete: function (file) {
		tempFile=file;
		checksum=checksum.digest('hex');
	  done=true;
	},
	onFileUploadData: function (file, data, req, res) {
		checksum.update(data);
	}
	}));

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

	//Static routes
	for(var route in conf.statics)
	{
		app.use( express.static( conf.statics[route] ) );
	}

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
				for(k in keys)
					keys[k]= decodeURIComponent(keys[k]);
				if(keys.user===undefined)
					keys.user=req.connection.remoteAddress;
				keys.time=Date.now();
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
						res.send(doc[0]);
					}
				});
			}
		}
	};

	read = function( req,res )
	{
		var id;
		id = req.params.id || req.body.id;
		if(id)
			id=id.split(",");
		else
		{
			res.status(400);
			res.send('Bad command');
		}
		mod.read( id, function( error, doc )
		{
			if( error )
			{
				res.status(409);
				res.send('Read Error, please change your values');
			}
			else
			{
				if(doc.length===0){
					res.status(404);
					res.send('Id not found');
				}
				else{
					res.status(200);
					res.send(doc);
				}
			}
		});
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
		if(keys.user===undefined)
			keys.user=req.connection.remoteAddress;
		keys.time=Date.now();
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
						res.status(200);
						res.json( doc );
					}
				});
			}
		}
	};

	deleteNode = function(req, res)
	{
		var id;
		id = req.params.id || req.body.id;
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
		var id;
		id = req.params.id || req.body.id;
		if( !id || id=="undefined" )
		{
			res.status(400);
			res.send('Bad command');
		}
		else{
			mod.graph(id, function(error, nodes){
				if(error){
					res.status(404).send('Id not found');
				}
				else if (nodes){
					res.json(nodes);
				}
				else
					res.status(404).send('Id not found');
			});
		}
	};

	search=function(req, res){
		var q;
		var q = req.params.query || req.body.query;
		if(!q || q=="undefined")
		{
			res.status(400);
			res.send('Bad command');
		}
		else{
			q= q.replace(/\s+/g,' ').trim();
			q= q.replace('< ','<');
			q= q.replace('<= ','<=');
			q= q.replace('>= ','>=');
			q= q.replace('> ','>');
			q= q.replace(': ',':');
			var arr = q.split(" ");
			var temp;
			var result={};
			var j;
			var tempField;
			for(i in arr){
				if(arr[i].indexOf('<=')>0){
					temp=arr[i].split('<=');
					result[temp[0]]={$lte:decodeURIComponent(temp[1])};
					continue;
				}
				if(arr[i].indexOf('<')>0){
					temp=arr[i].split('<');
					result[temp[0]]={$lt:decodeURIComponent(temp[1])};
					continue;
				}
				if(arr[i].indexOf('>=')>0){
					temp=arr[i].split('>=');
					result[temp[0]]={$gte:decodeURIComponent(temp[1])};
					continue;
				}
				if(arr[i].indexOf('>')>0){
					temp=arr[i].split('>');
					result[temp[0]]={$gt:decodeURIComponent(temp[1])};
					continue;
				}
				if(arr[i].indexOf(':')>0){
					temp=arr[i].split(':');
					tempField=temp[0];
					result[tempField]="";
					for(j=1;j<temp.length-1;j++)
						result[tempField]+=decodeURIComponent(temp[j])+":";
					if(temp[j]!='')
						result[tempField]+=decodeURIComponent(temp[j]);
					continue;
				}
				if(i==0){
					continue;
				}
				if(result[tempField]!='')
					result[tempField]+= " "+arr[i];
				else
					result[tempField]+=arr[i];
			}
			mod.search( result, function( error, doc )
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


	/**
	 * Import a JSON graph commit from our current Php Server
	 *
	 */
	importJSON = function( req, res )
	{
		var json = JSON.parse(req.body.text);
		json.nodes.forEach( function(node, i, nodes){
			var keys = node.keys;
			keys.mysqlid = node.id;
			mod.search({mysqlid:keys.mysqlid}, function(err, res){
				if(err)
				{
					console.log('ERROR');
					return;
				}
				if(res.length === 0)
				{
					mod.create( keys, function(err, n){
						if(err) console.log('ERROR create')
					});
				}
				else
				{
					console.log('found mysqlid:'+keys.mysqlid);
				}
				if (i===nodes.length -1){  // we finished inserting nodes
					json.links.forEach( function(link){
						console.log( link );
						mod.search({mysqlid:link.src_id.toString()}, function(err, res1){
							if (!err){
								mod.search({mysqlid:link.tgt_id.toString()}, function(err, res2){
									if (!err)
									{
										mod.create({src_id: res1[0], tgt_id: res2[0]}, function(){});
									}
									else
									{
										console.log('LINK ERR');
									}
								});
							}
							else
							{
								console.log('LINK ERR');
							}
						});
					});

				}
			})
		}, json);
		res.status(200);
		res.send();
	};


	getFile= function(req,res){
		res.writeHead(200);
		var stream = fs.createReadStream((fileSystem+(decodeURIComponent(req.params.path)).replace(/:/g,"").replace(/\/+/g,"/")), { bufferSize: 64 * 1024});
stream.pipe(res);

	};

	//Upload Management
	upload=function (req, res){
		if(done){
			var dest=decodeURIComponent(req.body.path);
			dest=fileSystem+dest.replace(/:/g,"");
			dest=dest.replace(/\/+/,"/");
			mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
				ncp(tempFile.path,dest, function (err) {
					if (err) {
						return console.error(err);
					}
					else {
						fs.unlinkSync(tempFile.path);
					}
				});
			});
			var keys={};
			keys.user=req.connection.remoteAddress;
			keys.time=Date.now();
			keys.file=decodeURIComponent(req.body.path);
			keys.checksum=checksum;
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
					res.send(doc[0]);
				}
			});
		}
	};

	uploadNewVersion=function (req, res){
		if(done){
			var dest=decodeURIComponent(req.body.path);
			dest=fileSystem+dest.replace(/:/g,"");
			dest=dest.replace(/\/+/g,"/");
			mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
				ncp(tempFile.path,dest, function (err) {
					if (err) {
						return console.error(err);
					}
					else {
						fs.unlinkSync(tempFile.path);
					}
				});
			});
			var keys={};
			keys.user=req.connection.remoteAddress;
			keys.time=Date.now();
			keys.checksum=checksum;
			mod.update(req.body.id,keys, function(error, doc)
			{
				if( error )
				{
					res.status(409);
					res.send('Update Error, please change your values');
				}
				else
				{
					res.status(201);
					res.send(doc);
				}
			});
		}
	};

	//
	// Extra operations
	//
	app.get('/graph/:id', graph);
	app.post('/import', importJSON);
	app.post('/upload', upload);
	app.put('/upload', uploadNewVersion);
	app.get('/subdirs/:path',getSubdirs);
	app.get('/subdirs',getSubdirs);
	app.get('/file/:path',getFile);

	//
	// Alternative Operations ()
	//
	app.get('/search',search);
	app.get('/graph/', graph);
	app.get('/', read);
	app.put('/', update);
	app.delete('/', deleteNode);

	//
	// CRUDS operations
	//
	app.post('/', create);
	app.get('/:id', read);
	app.put('/:id', update);
	app.delete('/:id', deleteNode);
	app.get('/search/:query',search);


}
