var express = require('express'),
    router=express.Router(),
    mongoMod= require('../model/model.js'),
    mod= new mongoMod();
router.get('/', mod.search);

//router.get('/:id', test.findById);

router.get('/search/:by/:id', mod.searchBy);

router.post('/', mod.add);

router.put('/:id', mod.update);

router.delete('/:id', mod.delete);


module.exports = router;
