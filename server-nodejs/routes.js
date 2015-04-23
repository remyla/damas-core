module.exports = function(app){

	var mongoMod 	= require('./model.js'),
		bodyParser 	= require('body-parser'),
		methodOverride = require('method-override'),
		mod				= new mongoMod(),
		morgan= require('morgan');

	//Handle request log
	app.use(morgan('combined'));

	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());
	//Handle errors
	app.use(function(err, req, res, next){
		if(err)
			console.log("An error has occurred: "+err);
		next();
	});
	app.use(methodOverride(function(req, res){
		if (req.body && typeof req.body === 'object' && '_method' in req.body) {
			// look in urlencoded POST bodies and delete it
			var method = req.body._method
			delete req.body._method
			return method
		}
	}));

	/* CRUD operations */
	create = function(req, res) {
		var obj_keys = Object.keys(req.body);
		if (obj_keys=== '' || !obj_keys || obj_keys.length === 0){
			res.status(400).send('Bad command');
		}
		else {
			var keys = req.body;
			mod.create(keys, function(error, doc){
				if(error){
					res.status(409).send('create Error, please change your values');
				}
				else if (error==null && doc){
					res.send(doc);
				}
			});
		}
	};

	read = function(req,res) {
		var id;
		if(req.params.id)
			id = req.params.id;
		else if(req.body.id)
			id= req.body.id;
		mod.read(id, function(error, doc){
			if(error){
				res.status(404).send('Id not found');
			}
			else if (error==null && doc){
				res.json(doc);
			}
			else
				res.status(404).send('Id not found');
		});
	};

	update = function(req, res){
		var id;
		var keys = req.body;
		if(req.params.id)
			id = req.params.id;
		else if(keys.id){
			id = keys.id;
			delete keys.id;
		}
		if(!id || Object.keys(keys).length === 0){
			res.status(400).send('Bad command');
		}
		else {
				mod.update(id, keys, function(error, doc){
				if(error){
					res.status(409).send('Update Error, please change your values');
				}
				else{
					res.json(doc);
				}
			});
		}
	};

	deleteNode = function(req, res){
		var id;
		if(req.params.id)
			id = req.params.id;
		else if(req.body.id)
			id = req.body.id;
		if(id)
			mod.deleteNode(id, function(error, doc){
				if(error){
					res.status(409).send('delete Error, please change your values');
				}
				else{
					res.send(doc.result.n+" documents deleted.");
				}
			});
		else
			res.status(400).send("Bad command");
	};

	app.get('/:id', read);
	app.get('/', read);
	app.post('/', create);
	app.put('/:id', update);
	app.put('/', update);
	app.delete('/:id', deleteNode);
	app.delete('/', deleteNode);
}
