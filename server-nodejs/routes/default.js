module.exports = function(app, express){
	var mongo = require( 'mongodb' ),
	mongoModel = require( '../model.js' ),
	bodyParser = require( 'body-parser' ),
	methodOverride = require( 'method-override' ),
	conf = require( '../conf.json' ),
	fs  = require('fs'),
	multer  = require('multer'),
	ncp= require('ncp').ncp;
	ObjectId = mongo.ObjectID;
	mod = new mongoModel(),
	mkdirp= require('mkdirp'),
	crypto= require('crypto'),

	mod.connection( function(){});

	ncp.limit=16;
	var checksum;
	var tempFile;
	var fileSystem=conf.fileSystem;
	//Middlewares
	app.use( bodyParser.json({limit: '50mb'}));
	app.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );

	app.use( multer({
		onError: function (error, next) {
			console.log(error);
			next(error);
		},
		onFileUploadStart: function (file) {
			checksum = crypto.createHash('sha1');
		},
		onFileUploadData: function (file, data, req, res) {
			checksum.update(data);
		},
		onFileUploadComplete: function (file, req, res) {
			//var dest=decodeURIComponent(req.body.path);
			var dest=fileSystem+decodeURIComponent(req.body.path).replace(/:/g,"");
			dest=dest.replace(/\/+/,"/");
			mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
				ncp(file.path, dest, function (err) {
					if (err) {
						return console.error(err);
					}
					else {
						fs.unlinkSync(file.path);
					}
				});
			});
			var keys={};
			keys.user=req.connection.remoteAddress;
			keys.time=Date.now();
			keys.file=decodeURIComponent(req.body.path);
			keys.checksum = checksum.digest('hex');
			keys.size = file.size;
			console.log(req.body.id);
			console.log(typeof(req.body.id));
			if (req.body.id === 'null')
			{
				mod.create(keys, function(error, doc)
				{
					if (error)
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
			else
			{
				mod.update(req.body.id, keys, function(error, doc)
				{
					if (error)
					{
						res.status(409);
						res.send('update Error, please change your values');
					}
					else
					{
						res.status(201);
						res.send(doc);
					}
				});
			}
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
	for(var route in conf.publiclyServedFolders)
	{
		app.use( express.static( conf.publiclyServedFolders[route] ) );
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
		if (Object.keys(req.body).length === 0)
		{
			res.status(400).send('create error: the body of the request is empty');
			return;
		}
		var keys = req.body;
		keys.author = req.user.username || req.connection.remoteAddress;
		keys.time = Date.now();
		mod.create(keys, function(error, doc){
			if (error)
			{
				res.status(409).send('create error, please change your values');
				return;
			}
			res.status(201).send(doc);
		});
	};

	read = function( req,res )
	{
		var id = req.params.id || req.body.id;
		if (!id)
		{
			res.status(400).send('read error: the specified id is not valid');
			return;
		}
		mod.read( id.split(","), function(error, doc){
			if (error)
			{
				res.status(409).send('read error, please change your values');
				return;
			}
			if (doc.length===0)
			{
				res.status(404).send('Id not found');
				return;
			}
			res.status(200).send(doc);
		});
	};

	update = function( req, res )
	{
/*
		if (!ObjectId.isValid(req.params.id))
		{
			res.status(400).send('update error: the specified id is not valid');
			return;
		}
		if (Object.keys(req.body).length === 0)
		{
			res.status(400).send('update error: the body of the request is empty');
			return;
		}
*/
		mod.update(req.params.id.split(","), req.body, function(error, doc){
			if (error)
			{
				res.status(409).send('update error, please change your values');
				return;
			}
			res.status(200).json(doc);
		});
	};

	deleteNode = function(req, res)
	{
		if (!ObjectId.isValid(req.params.id))
		{
			res.status(400).send('error: the specified id is not valid');
			return;
		}
		mod.deleteNode(req.params.id, function(error, doc){
			if (error)
			{
				res.status(409).send('delete error, please change your values');
				return;
			}
			res.status(200).send(doc.result.n + " documents deleted.");
		});
	};

	graph = function(req,res) {
		var id = req.params.id || req.body.id;
		if (!id || id=="undefined")
		{
			res.status(400).send('Bad command');
			return;
		}
		mod.graph( id.split(","), function(error, nodes){
			if (error)
			{
				res.status(409).send('graph error, please change your values');
				return;
			}
			if (nodes)
			{
				res.status(200).json(nodes);
			}
			else
				res.status(404).send('Id not found');
		});
	};

	search = function(req, res){
		var q = req.params.query || req.body.query;
		if (!q || q=="undefined")
		{
			res.status(400);
			res.send('Bad command');
			return;
		}
		q = q.replace(/\s+/g,' ').trim();
		//q = q.replace('< ','<');
		//q = q.replace('<= ','<=');
		//q = q.replace('>= ','>=');
		//q = q.replace('> ','>');
		//q = q.replace(': ',':');
		var terms = q.split(" ");
		var pair;
		var result={};
		//var j;
		//var tempField;
		for(var i=0; i< terms.length; i++){
			if (terms[i].indexOf('<=') > 0)
			{
				pair = terms[i].split('<=');
				result[pair[0]] = { $lte: decodeURIComponent(pair[1]) };
				continue;
			}
			if (terms[i].indexOf('<') > 0)
			{
				pair = terms[i].split('<');
				result[pair[0]] = { $lt: decodeURIComponent(pair[1]) };
				continue;
			}
			if (terms[i].indexOf('>=') > 0)
			{
				pair = terms[i].split('>=');
				result[pair[0]] = { $gte: decodeURIComponent(pair[1]) };
				continue;
			}
			if (terms[i].indexOf('>') > 0)
			{
				pair = terms[i].split('>');
				result[pair[0]] = { $gt: decodeURIComponent(pair[1]) };
				continue;
			}
			if (terms[i].indexOf(':') > 0)
			{
				pair = terms[i].split(':');
				var value = decodeURIComponent(pair[1]);
			
				var flags = value.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = value.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
				if(flags!=value && pattern!=value)
				{
					var regex = new RegExp(pattern, flags);
					result[pair[0]] = regex;
				}
				else
				{
					result[pair[0]] = value;
				}
/*
				for(j=1;j<pair.length-1;j++)
					result[tempField]+=decodeURIComponent(pair[j])+":";
				if(pair[j]!='')
					result[tempField]+=decodeURIComponent(pair[j]);
*/
				continue;
			}
/* implement full text search
			result['$where'] = function(){
				for (var key in this)
				{
					if (this[key] )
				}
			}
db.things.find({$where: function() {
  for (var key in this) {
    if (this[key] === "bar") {
      return true;
    }
    return false;
}});
*/
/*
			if(i==0){
				continue;
			}
			if(result[tempField]!='')
				result[tempField]+= " "+terms[i];
			else
				result[tempField]+=terms[i];
*/
		}
		mod.search( result, function(error, doc){
			if (error)
			{
				res.status(409).send('Read Error, please change your values');
				return;
			}
			res.status(200).send(doc);
		});
	}

	/**
	 * Check if an object is a valid json
	 * @param {JSON Object} JSON Object containing the keys - values
	 * @return {boolean} true if is valid, false otherwise
	 */
/*
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
*/


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
		//console.log(req.params.path );
		var path = fileSystem+decodeURIComponent(req.params.path).replace(/:/g,"").replace(/\/+/g,"/");
		fs.exists(path, function(exists){
			if(exists)
			{
				var stream = fs.createReadStream( path, { bufferSize: 64 * 1024});
				res.writeHead(200);
				stream.pipe(res);
			}
			else
			{
				res.status(404);
				res.send('File not found');
			}
		});
	};

	//Upload Management
	upload=function (req, res){
/*
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
			keys.author=req.connection.remoteAddress;
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
*/
	};

	uploadNewVersion=function (req, res){
/*
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
			keys.author=req.connection.remoteAddress;
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
*/
	};

	//
	// Extra operations
	//
	app.get('/api/graph/:id', graph);
	app.get('/api/file/:path(*)',getFile);
	app.post('/api/import', importJSON);
	app.post('/api/upload', upload);
	app.put('/api/upload', uploadNewVersion);
	//app.get('/subdirs/:path',getSubdirs);
	//app.get('/subdirs',getSubdirs);

	//
	// Alternative Operations ()
	//
	app.get('/api/search/:query(*)', search);
	app.get('/api/graph/', graph);
	app.get('/api/', read);
	//app.put('/', update);
	//app.delete('/', deleteNode);

	//
	// CRUDS operations
	//
	app.post('/api/', create);
	app.get('/api/:id', read);
	app.put('/api/:id', update);
	app.delete('/api/:id', deleteNode);
}
