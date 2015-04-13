module.exports = function(app){
// var express = require('express'),
//     //router  = express.Router(),
var mongoMod = require('./model/model.js'),
	mod      = new mongoMod();

// router.get('/:id', function(req, res){
//   var result= mod.read(id);
//   res.send(keys._id);
// });
get = function(req,res) {
	var result= mod.read(id);
	res.send(keys._id);
};

post = function(req,res) {
	var keys=req.body;
	var result= mod.create(keys);
	var result= mod.create(keys);
	res.send(keys._id);

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
app.get('/:id', get);
app.post('/add', post);
}