/*
 * auth-jwt-node.js
 */

module.exports = function (app) {
    var db  = app.locals.db;
    var conf = app.locals.conf.jwt;

    var expressJwt = require('express-jwt');
    var jwt = require('jsonwebtoken');
    var unless = require('express-unless');
    var crypto = require('crypto');
    var debug = require('debug')('app:auth:' + process.pid);
    var cookieParser = require('cookie-parser')
    debug("Authentication is JWT / " + conf.passwordHashAlgorithm +
        " / required=" + conf.required);

    var middleware = function () {
        var func = function (req, res, next) {
            if (!req.user.username && conf.required) {
                return res.status(401).json('401 Unauthorized (invalid token and authentication is required)');
            }
            return next();
        };
        func.unless = require('express-unless');
        return func;
    };
    var authenticate = function (req, res, next) {
        debug('Processing authenticate middleware');
        if (!req.body.username || !req.body.password) {
            debug('no username or password');
            return res.status(401).json('Invalid username or password');
        }
        let nameRegex = RegExp('^[a-z][-a-z0-9_]*\$');
        let obj;
        if (nameRegex.test(req.body.username)) {
            let obj = {'username' : req.body.username}; 
        } else {
            let obj = {'email' : req.body.username};
        }
        db.search(obj, function (err, doc) {
            if (err || doc.length === 0) {
                return res.status(401).json('Invalid username or password');
            }
            db.read([doc[0]], function (err, user) {
                user = user[0];
                if (32 === (user.password).length) {
                   var hashMethod = 'md5';
                }
                else {
                   var hashMethod = 'sha1';
                }
                if (crypto.createHash(hashMethod).update(req.body.password).digest('hex') !== user.password) {
                    return res.status(401).json('Invalid username or password');
                }
                debug('User authenticated, generating token');
                user.lastlogin = Date.now();
                db.update([user], function(err, nodes){
                    user.token = jwt.sign({ _id: user._id, username: user.username }, conf.secret, { expiresIn: conf.exp*60 });
                    var decoded = jwt.decode(user.token);
                    user.token_exp = decoded.exp;
                    user.token_iat = decoded.iat;
                    delete user.password;
                    debug('Token generated for user: %s, token: %s', user.username, user.token);
                    req.user = user;
                    req.user.address = req.connection.remoteAddress;
                    req.user.class = req.user.class || 'guest';
                    return res.status(200).json(req.user);
                });
            });
        });
    };

    var fetch = function (headers) {
        if (headers && headers.authorization) {
            var authorization = headers.authorization;
            var part = authorization.split(' ');
            if (part.length === 2) {
                var token = part[1];
                if ('null' === token) {
                    token = null;
                }
                return token;
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    var verify = function (req, res, next) {
        return res.status(200).json(req.user);
    }

    app.use(cookieParser());

    app.use(function (req, res, next){
        var token = fetch(req.headers) || req.cookies.token;
        if (null === token) {
            req.user = {};
            return next();
        }
        jwt.verify(token, conf.secret, function (err, decode) {
            if (err) {
                req.user = {};
                return next();
            }
            db.read([decode._id], function (err, user) {
                req.user = user[0];
                next();
            });
        });
    });

    app.use(conf.expressUse, middleware().unless(conf.expressUnless));
    app.get('/api/verify', verify );
    app.route('/api/signIn').post(authenticate, function (req, res, next) {
        res.status(200).json(req.user);
    });

}

