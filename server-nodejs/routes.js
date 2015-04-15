module.exports = function(app){

var mongoMod = require('./model.js'),
	bodyParser = require('body-parser'),
	mod      = new mongoMod();
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());
	//Handle errors
	app.use(function(err, req, res, next){
		if(err)
			console.log("hay un error: "+err);
		// } else {
		next();
		// }
	})

/*
	create = function(req,res) {
		var keys = req.body;
		mod.create(keys, function(error, doc){
			if(error){
				res.status(500).send(error);
			}
			else if (error==null && doc){
				res.send(keys._id);
			}
		});
	};

	update= function(req, res){
		var id = req.params.id;
		var keys=req.body;
		mod.update(id,keys,function(error,doc){
			if(error && !doc){
				res.status(500).send(error);
			}
			else if (error==null && doc){
				res.send(keys._id);
			}
		});
	};

	deleteNode= function(req, res){
		var id = req.params.id;
		var result= mod.deleteNode(id,res);
	};


	app.get('/:id', read);
	app.post('/', create);
	app.put('/:id', update);
	app.delete('/:id', deleteNode); */

read = function(req,res) {
	var id= req.params.id;
	mod.read(id, function(error, doc){
		if(error && !doc){
			res.status(500).send('Aucun document ne possede cet id.');
		}
		else if (error==null && doc){
			res.json(doc);
		}
	});
};

create = function(req,res) {
	var obj_keys = Object.keys(req.body);
	
	console.log('body size keys'+obj_keys.length);
	
	if (obj_keys=== '' || !obj_keys || obj_keys.length === 0){
		res.status(400).send('Bad command');
	}
	else {
		var keys = req.body;
		console.log(keys);
		mod.create(keys, function(error, doc){
			if(error){
				res.status(409).send('create Error, please change your values');
			}
			if (error==null && doc){
				res.send(keys._id);
			}
		});
	}
};

update= function(req, res){
  var id = req.params.id;
  var keys=req.body;
  var result= mod.update(id,keys, function(error, doc){
		if(error){
			res.status(500).send(error);
		}
		else if (!error && doc){
			res.json(doc);
		}
		else
			res.send('Aucun document ne possede cet id.');
	});
};

deleteNode= function(req, res){
  var id = req.params.id;
  var result= mod.deleteNode(id, function(error, doc){
		if(error){
			res.status(500).send(error);
		}
		else if (!error && doc){
			res.json(doc);
		}
		else
			res.send('Aucun document ne possede cet id.');
	});
};

app.get('/:id', read);
app.post('/', create);
app.put('/:id', update);
app.delete('/:id', deleteNode);
}
