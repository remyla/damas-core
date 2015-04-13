var express = require('express'),
    router=express.Router(),
    mongoMod= require('../model/model.js'),
    mod= new mongoMod();
router.post('/search', function(req, res){
  var items;
  var keys= req.body;
  items= mod.search(keys, res);
  //res.send(items);
});

//router.get('/:id', test.findById);

router.post('/add', function(req, res){
  var keys=req.body;
  var result= mod.create(keys);
  res.send(keys._id);
});
/*
router.put('/:id', mod.update);

router.delete('/:id', mod.deleteNode);*/


module.exports = router;
