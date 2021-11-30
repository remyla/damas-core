/*
 * Licensed under the GNU GPL v3
 *
 * This extension is not maintained anymore. Please contact contact@primcode.com
 * if you are interested in an up-to-date extension for the same purpose.
 *
 * depends on: nodemailer
 */

module.exports = function (app, routes){
    var db = app.locals.db;
    var conf = app.locals.conf;
    var crypto = require('crypto');
    var ejs = require('ejs');
    var debug = require('debug')('app:user_setup');

    /*
     * lostPassword()
     *
     * Method:
     * URI: /api/lostPassword/
     *
     * Send email to the user with a link containing a unique token
     *
     * HTTP status codes:
     * - 200: OK (email sent)
     * - 404: Not Found (email not found)
     * - 409: Conflict
     */
    lostPassword = function(req, res) {
         var email = req.params.email || req.body.email;
         db.search({'email':email}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length < 1) {
                return res.status(200).send('"email sent"');
            }
            var random = crypto.randomBytes(16).toString('hex');
            var checksum = crypto.createHash('sha1');
            checksum.update(id[0] + random);
            var token = checksum.digest('hex');

            var node = {'_id': id[0], 'token':token};
            db.update([node], function(err, result) {
                if(err) {
                    return res.sendStatus(409);
                }
                var url = req.protocol + '://' + req.get('host');
                var link = url + '/resetPassword?token=' + token;
                var mail = {
                    from: conf.nodemailer.from,
                    to: result[0].email,
                    subject: 'Lost password',
                    text: 'Follow this link to reset your password: ' + link,
                }
                ejs.renderFile(__dirname + '/user_mail_lostPassword.ejs', {link: link},
                        function (err, html) {
                    if (!err) {
                        mail.html = html;
                    }
                    app.locals.extensions.nodemailer.sendMail(mail,
                            function (err, info) {
                        if (err) {
                            return debug(err);
                        }
                        debug(info);
                    });
                    debug(err);
                });
                return res.status(200).send('"email sent"');
            });
         });
    };

    updateNodePassword = function(id, password, callback) {
        var checksum = crypto.createHash('sha1');
        checksum.update(password);
        var crypted = checksum.digest('hex');

        var node = {'_id':id, 'password':crypted};
        db.update([node], function(err, result) {
            return callback(result[0]);
        });
    };

    /*
     * changePassword()
     *
     * Method: POST
     * URI: /api/changePassword
     *
     * Change the user's password in the database
     *
     * HTTP status codes:
     * - 200: OK
     * - 400: Bad Request (Passwords not identical)
     * - 409: Conflict
     */
    changePassword = function(req, res) {
        db.search({'username':req.user.username}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length < 1) {
                return res.sendStatus(404);
            }
            updateNodePassword(id[0], req.body.password, function(response) {
                return res.sendStatus(200);
            });
        });
    };

    /*
     * resetPassword()
     *
     * Method: POST
     * URI: /api/resetPassword/
     *
     * Change the user's password in the database
     *
     * HTTP status codes:
     * - 200: OK
     * - 400: Bad Request (Passwords not identical)
     * - 404: Not Found (invalid token)
     * - 409: Conflict
     */
    resetPassword = function(req, res) {
        db.search({'token':req.params.token}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length < 1) {
                return res.sendStatus(404);
            }
            updateNodePassword(id[0], req.body.password, function(node) {
                node.token = null;
                db.update([node], function(err, result) {
                    if(err) {
                        return res.sendStatus(409);
                    }
                    return res.sendStatus(200);
                });
            });
        });
    };

    app.get('/api/lostPassword/:email', lostPassword);
    app.post('/api/changePassword/', changePassword);
    app.post('/api/resetPassword/:token', resetPassword);

    routes = Object.assign(routes, {
        lostPassword: lostPassword,
        changePassword: changePassword,
        resetPassword: resetPassword
    });
};
