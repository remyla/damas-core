/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf.static_routes;
    var debug = require('debug')('app:staticRoutes');
    var path = require('path');
    for (var route in conf.staticRoutes) {
        if (!conf.staticRoutes.hasOwnProperty(route)) {
            continue;
        }
        debug('Registered static route: ' + route + " -> " + conf.staticRoutes[route]);
        app.get(route, function( req, res ){
            res.sendFile(path.resolve(conf.staticRoutes[req.path]));
        });
    }
    for (var route in conf.publiclyServedFolders) {
        debug('Registered publicly served folder: ' + conf.publiclyServedFolders[route]);
        app.use(express.static(conf.publiclyServedFolders[route]));
    }
}


