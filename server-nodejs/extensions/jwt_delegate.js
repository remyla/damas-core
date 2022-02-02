/*
 * jwt_delegate.js
 *
 * Make a request to the server in file conf.json and stock the user node in the tracker.
 *
 *
 */

module.exports = function (app) {
    var db = app.locals.db;
    //let XHR = require('xmlhttprequest-ssl');
    var XMLHttpRequest = require("xmlhttprequest-ssl").XMLHttpRequest;
    var debug = require('debug')('damas:extensions:jwt_delegate');

    var server = app.locals.conf.jwt_delegate.server;

    app.use('/api/signIn', function (req, res, next) {
        debug(server);
        if ('undefined' != req.body.username) {
            var xhr = new XMLHttpRequest();
            xhr.onerror = function () {
                debug(server);
                console.error("Error request");
                next();
            }
            xhr.onreadystatechange = function (err) {
                if (4 === this.readyState) {
                    if (200 === this.status) {
                        var response = JSON.parse(this.responseText);
                        if (undefined === response.user) {
                            console.warn("Impossible authentication with that version of damas.core. Please, update damas-core or disabled jwt_delegate extention.");
                            return next();
                        }
                        db.create([response.user], function (err, nodes) {
                            if (err) {
                                console.warn("Creation user node impossible in the database.");
                                return next();                        
                            }
                            if (null === nodes[0]) {
                                db.update([response.user], function (err, doc) {
                                    if (err) {
                                        console.warn("Updating user node impossible.");
                                        return next();
                                    }
                                    return next();
                                });
                            } else {
                                return next();
                            }
                        });
                    } else if (this.status >= 500) {
                        debug(server);
                        console.warn("No response from the server " + "'" + server + "'" + " for your request. Please check the server URL in the conf.json.");
                        return next();
                    } else if (this.status === 401) {
                        debug(server);
                        console.warn("Invalid username or passeword");
                        return next();
                    }
                }
            }
            xhr.open("POST", server, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            var login = "username=" + req.body.username + "&password=" + req.body.password;
            debug(login);
            xhr.send(login);
        }
    });
}
