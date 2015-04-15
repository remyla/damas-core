module.exports = function(app){
var mongoMod = require('./model.js'),

	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mod      = new mongoMod();
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());

	app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

read = function(req,res) {
	var id;
	if(req.params.id)
		id= req.params.id;
	else if(req.body.id)
		id= req.body.id;
	mod.read(id, function(error, doc){
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

create = function(req,res) {
	var keys=req.body;
	mod.create(keys, function(error, doc){
		if(error){
			res.status(500).send(error);
		}
		else{
			res.send(doc);
		}
	});
};

update= function(req, res){
	var id;
	var keys=req.body;
	if(req.params.id)
		id= req.params.id;
	else if(keys.id){
		id= keys.id;
		delete keys.id;
	}
  var result= mod.update(id,keys, function(error, doc){
		if(error){
			res.status(500).send(error);
		}
		else{
			res.json(doc);
		}
	});
};

deleteNode= function(req, res){
	var id;
	if(req.params.id)
		id= req.params.id;
	else if(req.body.id)
		id= req.body.id;
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
app.get('/', read);
app.post('/', create);
app.put('/:id', update);
app.put('/', update);
app.delete('/:id', deleteNode);
app.delete('/', deleteNode);
}
