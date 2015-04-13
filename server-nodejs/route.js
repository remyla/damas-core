var express = require('express'),
    router=express.Router(),
    mongoMod= require('./model/model.js'),
    mod= new mongoMod();

router.get('/:id', function(req, res){
  var id= req.params.id;
  var result= mod.read(id, res);
});

router.post('/add', function(req, res){
  var keys=req.body;
  var result= mod.create(keys);
  res.send(keys._id);
});
/*
router.put('/:id', mod.update);

router.delete('/:id', mod.deleteNode);*/


module.exports = router;
