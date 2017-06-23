/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf.static_routes;
    var debug = require('debug')('app:staticRoutes');
    for (var route in conf.routes) {
        debug('Registered static route: ' + route + ' -> ' + conf.routes[route]);
        app.use(route, express.static(conf.routes[route], {
            'extensions': 'html'
        }));
    }
}


