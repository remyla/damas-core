var express = require('express');
var router = express.Router();
var bodyParser = require( 'body-parser' );

router.use(bodyParser());

// if is already locked returns false
router.put('/api/lock/:id', function(req, res){
	if (!ObjectId.isValid(req.params.id))
	{
		res.status(400).send('lock error: the specified id is not valid');
		return;
	}
	var n = mod.readOne(req.params.id, function(err, n){
		if (n.lock !== undefined)
		{
			res.status(409).send('lock error, the asset is already locked');
			return;
		}
		var keys = {
			"lock": req.user.username || req.connection.remoteAddress
		};
		mod.update(req.params.id, keys, function(error, doc){
			if (error)
			{
				res.status(409).send('lock error, please change your values');
				return;
			}
			res.status(200).send('asset locked');
		});
	});
});

router.put('/api/unlock/:id', function(req, res){
	if (!ObjectId.isValid(req.params.id))
	{
		res.status(400).send('lock error: the specified id is not valid');
		return;
	}
	var n = mod.readOne(req.params.id, function(err, n){
		if (n.lock !== ( req.user.username || req.connection.remoteAddress) )
		{
			res.status(409).send('lock error, the asset is locked by '+ n.lock);
			return;
		}
		mod.update(req.params.id, { "lock": null }, function(error, doc){
			if (error)
			{
				res.status(409).send('lock error, please change your values');
				return;
			}
			res.status(200).send('asset unlocked');
		});
	});
});

router.post('/api/version/:id', function(req, res){
	var keys = req.body;
	keys.author = req.user.username || req.connection.remoteAddress;
	keys.time = Date.now();
	keys.file = req.params.path;
	keys['#parent'] = req.params.id;
	mod.create(keys, function(error, doc){
		if (error)
		{
			res.status(409).send('create error, please change your values');
			return;
		}
		res.status(201).send(doc);
	});

	mod.create();
});

module.exports = router;
