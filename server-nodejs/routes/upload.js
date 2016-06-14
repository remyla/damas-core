/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
	var db = app.locals.db;
	var conf = app.locals.conf;

	var fs = require('fs');
	var multer = require('multer');
	var ncp = require('ncp').ncp;
	var mkdirp = require('mkdirp');
	var crypto = require('crypto');

	ncp.limit= 16;
	var checksum;
	var tempFile;
	var fileSystem= conf.fileSystem;

	app.use(multer({
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
			var dest = fileSystem + decodeURIComponent(req.body.path).replace(/:/g, '');
			dest = dest.replace(/\/+/, '/');
			mkdirp(dest.replace(/\/[^\/]*$/, ''), function (err) {
				ncp(file.path, dest, function (err) {
					if (err) {
						return console.error(err);
					} else {
						fs.unlinkSync(file.path);
					}
				});
			});
			var node = {
				author: req.user.username,
				time: Date.now(),
				file: decodeURIComponent(req.body.path),
				checksum: checksum.digest('hex'),
				size: file.size,
			};
			if (!req.body.id || 'null' === req.body.id) {
				db.create([node], function (error, doc) {
					if (error) {
						res.status(409);
						res.send('create Error, please change your values');
					} else {
						res.status(201);
						res.json(doc[0]);
					}
				});
			} else {
				node._id = req.body.id;
				db.update([node], function (error, doc) {
					if (error) {
						res.status(409);
						res.send('update Error, please change your values');
					} else {
						res.status(201);
						res.json(doc[0]);
					}
				});
			}
		}
	}));
}


