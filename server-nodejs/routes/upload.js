module.exports = function(app){
	var db = app.locals.db;
	var conf = app.locals.conf;

	var fs = require('fs');
	var multer = require('multer');
	var ncp = require('ncp').ncp;
	var mkdirp = require('mkdirp');
	var crypto = require('crypto');

	ncp.limit=16;
	var checksum;
	var tempFile;
	var fileSystem=conf.fileSystem;

	app.use( multer({
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
				db.create(keys, function(error, doc)
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
				db.update([req.body.id], keys, function(error, doc)
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
			db.create(keys, function(error, doc)
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
			db.update(req.body.id,keys, function(error, doc)
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

	app.post('/api/upload', upload);
	app.put('/api/upload', uploadNewVersion);

}
