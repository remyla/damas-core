/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, routes) {
    var db = app.locals.db;
    var conf = app.locals.conf;

    var multer = require('multer');
    var crypto = require('crypto');
    var mv = require('mv');

    var checksum;
    var fileSystem = conf.fileSystem;
    var versionDir = conf.fileSystem + '.damas/versions/';

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
            var node = {
                author: req.user.username,
                time: Date.now(),
                file: decodeURIComponent(req.body.path),
                checksum: checksum.digest('hex'),
                size: file.size,
                version: 1
            };
            var dest = fileSystem + node.file.replace(/:/g, '');
            dest = dest.replace(/\/+/g, '/');

            /*
             * Attempt to save the previous version
             */
            if (req.body.id && 'null' !== req.body.id) {
                db.read([req.body.id], function (err, versions) {
                    if (err) {
                        return moveUploadedFile();
                    }
                    // Name the file with its time key and move it to versions
                    var path = formatVersion(node.file, versions[0].time);
                    path = (versionDir + path).replace(/\/+/g, '/');
                    mv(dest, path, {mkdirp: true}, function (err) {
                        if (err) {
                            console.error(err);
                            return httpStatus(res, 500, 'Upload');
                        }
                        moveUploadedFile();
                    });
                });
            } else {
                moveUploadedFile();
            }

            /*
             * Move the uploaded file in the right place, then save its node
             */
            function moveUploadedFile() {
                mv(file.path, dest, {mkdirp: true}, function (err) {
                    if (err) {
                        console.error(err);
                        return httpStatus(res, 500, 'Upload');
                    }
                    if (!req.body.id || 'null' === req.body.id) {
                        req.body = node;
                        req.upload = node;
                        routes.create(req, res);
                    } else {
                        req.params.id = req.body.id;
                        req.body = node;
                        req.upload = node;
                        routes.version(req, res);
                    }
                });
            }
        }
    }));

    // Empty routes not calling next() to prevent Express from throwing errors
    app.post('/api/upload', function () {});
    app.put('/api/upload', function () {});
}


