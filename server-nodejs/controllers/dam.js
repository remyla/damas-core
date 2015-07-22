var express = require('express');
var router = express.Router();
var bodyParser = require( 'body-parser' );

router.use(bodyParser());

// if is already locked returns false
router.put('/lock/:id', function(req, res){
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
			"lock": req.connection.remoteAddress
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

router.put('/unlock/:id', function(req, res){
	console.log('unlock');
	if (!ObjectId.isValid(req.params.id))
	{
		res.status(400).send('lock error: the specified id is not valid');
		return;
	}
	var n = mod.readOne(req.params.id, function(err, n){
		if (n.lock !== req.connection.remoteAddress)
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

module.exports = router;
