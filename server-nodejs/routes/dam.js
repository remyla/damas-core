module.exports = function(app){
	var db  = app.locals.db;
	// if is already locked returns false
	app.put('/api/lock/:id', function(req, res){
		/* this check should not be based on mongo ObjectId, we disable it
		if (!ObjectId.isValid(req.params.id))
		{
			res.status(400).send('lock error: the specified id is not valid');
			return;
		}
		*/
		var n = db.readNodes(req.params.id, function(err, n){
			if (n[0].lock !== undefined)
			{
				res.status(409).send('lock error, the asset is already locked');
				return;
			}
			var keys = {
				"lock": req.user.username || req.connection.remoteAddress
			};
			db.updateNodes([req.params.id], keys, function(error, doc){
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
		var n = db.readNodes(req.params.id, function(err, n){
			if (n[0].lock !== ( req.user.username || req.connection.remoteAddress) )
			{
				res.status(409).send('lock error, the asset is locked by '+ n[0].lock);
				return;
			}
			db.updateNodes([req.params.id], { "lock": null }, function(error, doc){
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
		db.createNodes(keys, function(error, doc){
			if (error)
			{
				res.status(409).send('create error, please change your values');
				return;
			}
			res.status(201).send(doc);
		});
	});
}
