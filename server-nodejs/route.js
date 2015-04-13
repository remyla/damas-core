var express = require('express'),
    router=express.Router(),
    mongoMod= require('./model/model.js'),
    mod= new mongoMod();

router.get('/:id', function(req, res){
  var id= req.params.id;
  mod.read(id, res);
});

router.post('/add', function(req, res){
  var keys=req.body;
  var result= mod.create(keys);
  res.send(keys._id);
});

router.put('/:id', function(req, res){
  var id = req.params.id;
  var keys=req.body;
  var result= mod.update(id,keys, res);
  //res.send(keys._id);
});

router.delete('/:id', function(req, res){
  var id = req.params.id;
  var result= mod.deleteNode(id,res);
  //res.send(keys._id);
});

module.exports = router;
