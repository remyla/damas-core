module.exports = function(app){
// var express = require('express'),
//     //router  = express.Router(),
var mongoMod = require('./model/model.js'),
	mod      = new mongoMod();

// router.get('/:id', function(req, res){
//   var result= mod.read(id);
//   res.send(keys._id);
// });
read = function(req,res) {
	var result= mod.read(id);
	res.send(keys._id);
};

create = function(req,res) {
	var keys=req.body;
	var result= mod.create(keys);
	res.send(keys._id);
};

update= function(req, res){
  var id = req.params.id;
  var keys=req.body;
  var result= mod.update(id,keys, res);
};

deleteNode= function(req, res){
  var id = req.params.id;
  var result= mod.deleteNode(id,res);
};
// router.post('/add', function(req, res){
//   var keys=req.body;
//   var result= mod.create(keys);
//   res.send(keys._id);
// });
/*
router.put('/:id', mod.update);

router.delete('/:id', mod.deleteNode);*/


//module.exports = router;
app.get('/:id', read);
app.post('/add', create);
app.put('/:id', update);
app.delete('/:id', deleteNode);
}
