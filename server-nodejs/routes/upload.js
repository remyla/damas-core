var express = require('express');
var router = express.Router();
var mongoModel = require( '../model.js' );
var bodyParser = require( 'body-parser' );

var conf = require( '../conf.json' );
var fs = require('fs');
var multer = require('multer');
var ncp = require('ncp').ncp;
//ObjectId = mongo.ObjectID;
var mod = new mongoModel();
var mkdirp = require('mkdirp');
var crypto = require('crypto');

mod.connection( function(){});

ncp.limit=16;
var checksum;
var tempFile;
var fileSystem=conf.fileSystem;
//Middlewares
router.use( bodyParser.json({limit: '50mb'}));
router.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );

router.use( multer({
	onError: function (error, next) {
		console.log(error);
		next(error);
	},
	onFileUploadStart: function (file) {
		checksum = crypto.createHash('sha1');
	},
	onFileUploadData: function (file, data, req, res) {
		checksum.update(data);
	},
	onFileUploadComplete: function (file, req, res) {
		//var dest=decodeURIComponent(req.body.path);
		var dest=fileSystem+decodeURIComponent(req.body.path).replace(/:/g,"");
		dest=dest.replace(/\/+/,"/");
		mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
			ncp(file.path, dest, function (err) {
				if (err) {
					return console.error(err);
				}
				else {
					fs.unlinkSync(file.path);
				}
			});
		});
		var keys={};
		keys.author = req.user.username || req.connection.remoteAddress;
		keys.time=Date.now();
		keys.file=decodeURIComponent(req.body.path);
		keys.checksum = checksum.digest('hex');
		keys.size = file.size;
		console.log(req.body.id);
		console.log(typeof(req.body.id));
		if (req.body.id === 'null')
		{
			mod.create(keys, function(error, doc)
			{
				if (error)
				{
					res.status(409);
					res.send('create Error, please change your values');
				}
				else
				{
					res.status(201);
					res.send(doc);
				}
			});
		}
		else
		{
			mod.update([req.body.id], keys, function(error, doc)
			{
				if (error)
				{
					res.status(409);
					res.send('update Error, please change your values');
				}
				else
				{
					res.status(201);
					res.send(doc);
				}
			});
		}
	}
}));

//Upload Management
upload=function (req, res){
/*
	if(done){
		var dest=decodeURIComponent(req.body.path);
		dest=fileSystem+dest.replace(/:/g,"");
		dest=dest.replace(/\/+/,"/");
		mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
			ncp(tempFile.path,dest, function (err) {
				if (err) {
					return console.error(err);
				}
				else {
					fs.unlinkSync(tempFile.path);
				}
			});
		});
		var keys={};
		keys.author=req.connection.remoteAddress;
		keys.time=Date.now();
		keys.file=decodeURIComponent(req.body.path);
		keys.checksum=checksum;
		mod.create(keys, function(error, doc)
		{
			if( error )
			{
				res.status(409);
				res.send('create Error, please change your values');
			}
			else
			{
				res.status(201);
				res.send(doc[0]);
			}
		});
	}
*/
};

uploadNewVersion=function (req, res){
/*
	if(done){
		var dest=decodeURIComponent(req.body.path);
		dest=fileSystem+dest.replace(/:/g,"");
		dest=dest.replace(/\/+/g,"/");
		mkdirp(dest.replace(/\/[^\/]*$/,""),function(err){
			ncp(tempFile.path,dest, function (err) {
				if (err) {
					return console.error(err);
				}
				else {
					fs.unlinkSync(tempFile.path);
				}
			});
		});
		var keys={};
		keys.author=req.connection.remoteAddress;
		keys.time=Date.now();
		keys.checksum=checksum;
		mod.update(req.body.id,keys, function(error, doc)
		{
			if( error )
			{
				res.status(409);
				res.send('Update Error, please change your values');
			}
			else
			{
				res.status(201);
				res.send(doc);
			}
		});
	}
*/
};

router.post('/api/upload', upload);
router.put('/api/upload', uploadNewVersion);


module.exports = router;
