/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf.static_routes;
    var debug = require('debug')('damas:extensions:staticRoutes');
    function mkStaticRoute(route, localPath){
        debug('Registered static route: ' + route + ' -> ' + localPath);
        app.use(route, express.static(localPath, {
            'extensions': 'html'
        }));
    }
    for (var route in conf.routes) {
        if (Object.prototype.toString.call(conf.routes[route]) === '[object Array]') {
            conf.routes[route].forEach(function(r){
                mkStaticRoute(route, r);
            });
        } else {
            mkStaticRoute(route, conf.routes[route]);
        }
    }
}


