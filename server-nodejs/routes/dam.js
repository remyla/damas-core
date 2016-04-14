module.exports = function(app){
	var mod  = app.locals.mod;
	// if is already locked returns false
	app.put('/api/lock/:id', function(req, res){
		/* this check should not be based on mongo ObjectId, we disable it
		if (!ObjectId.isValid(req.params.id))
		{
			res.status(400).send('lock error: the specified id is not valid');
			return;
		}
		*/
		var n = mod.readOne(req.params.id, function(err, n){
			if (n.lock !== undefined)
			{
				res.status(409).send('lock error, the asset is already locked');
				return;
			}
			var keys = {
				"lock": req.user.username || req.connection.remoteAddress
			};
			mod.update([req.params.id], keys, function(error, doc){
				if (error)
				{
					res.status(409).send('lock error, please change your values');
					return;
				}
				res.status(200).send('asset locked');
			});
		});
	});
	app.put('/api/unlock/:id', function(req, res){
		/*
		if (!ObjectId.isValid(req.params.id))
		{
			res.status(400).send('lock error: the specified id is not valid');
			return;
		}
		*/
		var n = mod.readOne(req.params.id, function(err, n){
			if (n.lock !== ( req.user.username || req.connection.remoteAddress) )
			{
				res.status(409).send('lock error, the asset is locked by '+ n.lock);
				return;
			}
			mod.update([req.params.id], { "lock": null }, function(error, doc){
				if (error)
				{
					res.status(409).send('lock error, please change your values');
					return;
				}
				res.status(200).send('asset unlocked');
			});
		});
	});
	app.post('/api/version/:id', function(req, res){
		var keys = req.body;
		if (!keys.file)
		{
			res.status(400).send('version error: file key must be specified');
			return;
		}
		keys.author = req.user.username || req.connection.remoteAddress;
		keys.time = Date.now();
		keys['#parent'] = req.params.id;
		mod.create(keys, function(error, doc){
			if (error)
			{
				res.status(409).send('create error, please change your values');
				return;
			}
			res.status(201).send(doc);
		});
	});
	app.post('/api/link', function(req, res){
		if (!req.body.target)
		{
			console.log('link error: target must be specified');
			res.status(400).send('link error: target must be specified');
			return;
		}
		if (!req.body.sources)
		{
			console.log('link error: sources must be specified');
			res.status(400).send('link error: sources must be specified');
			return;
		}
		var sources = req.body.sources
		var keys = req.body.keys || {}
		var result = [];
		keys.author = req.user.username || req.connection.remoteAddress;
		keys.time = Date.now();
		mod.search({file:req.body.target}, function(err,res){
			if (err)
			{
				console.log('link error: target path not found');
				res.status(400).send('link error: target path not found');
				return;
			}
			var tgt_id = res[0]
			console.log('tgt_id='+tgt_id)
			for( var i=0; i<sources.length; i++)
			{
				mod.search({file:sources[i]}, function(err,res){
					if (err || res.length === 0)
					{
						console.log('not found')
						return
					}
					console.log(res[0])
					var new_node = {'tgt_id':tgt_id,'src_id':res[0]}
					for (var attrname in keys) { new_node[attrname] = keys[attrname] }
					mod.create(new_node, function(err, res){
						console.log(res)
						result.push(res._id.toString())
					})
				})
			}
		})
		res.status(200).json(result);
	});
}
