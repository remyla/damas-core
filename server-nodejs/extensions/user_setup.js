/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, routes){
    var db = app.locals.db;
    var conf = app.locals.conf;
    var crypto = require('crypto');
    var ejs = require('ejs');
    var debug = require('debug')('app:user_setup');

    /*
     * signUp()
     *
     * Method:
     * URI: /api/signUp/
     *
     * Create a new user
     *
     * HTTP status codes:
     * - 201: Created (user node created)
     * - 400: Bad request (not formatted correctly)
     * - 409: Conflict (a node already exist with this identifier)
     *
     */
    signUp = function(req, res) {
        if(typeof req.body !== 'object') {
            return res.status(400).send('Bad Request (not formatted correctly)');
        }
        if(!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).send('Bad Request (not formatted correctly)');
        }

        var addedProperties = {
            class: 'user',
            active: false,
            _id: 'usr_' + req.body.username
        };

        db.search({'email':req.body.email}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length > 0) {
                return res.status(409).send('Email is already in use');
            }
            var userNode = Object.assign({}, req.body, addedProperties);

            var pwd = userNode.password;
            var checksum = crypto.createHash(conf.jwt.passwordHashAlgorithm);
            checksum.update(pwd);
            var crypted = checksum.digest('hex');
            var token = crypto.randomBytes(16).toString('hex');

            userNode.password = crypted;
            userNode.token = token;

            db.create([userNode], function(err, node) {
                if(err) {
                    res.status(409).send('Erreur');
                }
                var userEmail = node[0].email;

                var url = req.protocol + '://' + req.get('host') + req.url;
                var params = userNode.username + '/' + userNode.token;
                var link = url + params;
                var mail = {
                    from: conf.nodemailer.from,
                    to: userEmail,
                    subject: 'Validate your account',
                    text: 'Valider votre inscription: ' + link
                }
                ejs.renderFile('views/mail_signIn.ejs', {link: link},
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
                });
            });
        });
    };

    /*
     * userActivate()
     *
     * Method:
     * URI: /api/userActivate/
     *
     * Activate user account
     *
     * HTTP status codes:
     * - 302: Found (OK and redirected)
     * - 403: Forbidden (invalid token)
     * - 404: Not Found
     * - 409: Conflict
     */
    userActivate = function(req, res) {
        var username = req.params.user || req.body.user;
        var token = req.params.token || req.body.token;
        db.search({'username':username}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length < 1) {
                return res.status(404).send('Username not found');
            }
            db.read(id, function(err, node) {
                if(node[0].token !== token) {
                    return res.status(403).send('Token does not correspond to user');
                }
                node[0].active = true;
                node[0].token = null;
                db.update(node, function(err, result) {
                    if(err) {
                        return res.sendStatus(409);
                    }
                    res.redirect('/signIn');
                    return;
                });
            });
        });
    };

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
                return res.status(404).send('No user with this email');
            }
            var username = id[0].substring(id[0].indexOf('_') + 1);
            var random = crypto.randomBytes(16).toString('hex');
            var checksum = crypto.createHash(conf.jwt.passwordHashAlgorithm);
            checksum.update(username + random);
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
                ejs.renderFile('views/mail_lostPassword.ejs', {link: link},
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

    /*
     * resetPassword()
     *
     * Method:
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
        var token = req.params.token;
        var pwd = req.body.password;
        var checksum = crypto.createHash(conf.jwt.passwordHashAlgorithm);
        checksum.update(pwd);
        var crypted = checksum.digest('hex');
        db.search({'token':token}, function(err, id) {
            if(err) {
                return res.sendStatus(409);
            }
            if(id.length < 1) {
                return res.sendStatus(404);
            }
            var node = {'_id':id[0], 'password':crypted, 'token':null};
            db.update([node], function(err, result) {
                if(err) {
                    return res.sendStatus(409);
                }
                return res.status(200).send(result);
            });

        });
    };

    app.post('/api/signUp/', signUp);
    app.get('/api/userActivate/:user/:token', userActivate);
    app.get('/api/lostPassword/:email', lostPassword);
    app.post('/api/resetPassword/:token', resetPassword);

    routes = Object.assign(routes, {
        signUp: signUp,
        userActivate: userActivate,
        lostPassword: lostPassword,
        resetPassword: resetPassword
    });
};
