/*
 * jwt_delegate.js
 *
 * Make a request to the server in file conf.json and stock the user node in the tracker.
 */
 
module.exports = function (app) {
    let db  = app.locals.db;
    let XHR = require('xmlhttprequest');

    server = app.locals.conf.jwt_delegate.server;
    
    app.use('/api/signIn', function (req, res, next) {
        if ('undefined' != req.body.username) {
            let login = "username=" + req.body.username + "&password=" + req.body.password;
            let request = new XHR.XMLHttpRequest();
            request.open("POST", server, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.onerror = function () {
                console.error("Connection impossible with " + "'" + server + "'");
            }
            request.onload = function (err) {
                if (405 === request.status) {
                    request.onerror();   
                }
                if (4 === request.readyState && 200 === request.status) { 
                    responseText = JSON.parse(request.responseText);
                    if (undefined === responseText.user) {
                        console.warn("Impossible authentication with that version of damas.core. Please, update damas-core or disabled jwt_delegate extention.");
                        return next();
                    }
                    db.create([responseText.user], function (err, nodes) {
                        if (err) {
                            console.warn("Creation user node impossible in the database.");
                            return next();
                        }
                        if (null === nodes[0]) {
                            db.update([responseText.user], function (err, doc) {
                                if (err) {
                                    console.warn("Updating user node impossible.");
                                    return next();
                                }
                            });
                        }
                    });
                }
            }
            request.send(login);
        }
        next();
    });
}

