/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf;
    var debug = require('debug')('app:init');
    require('./utils');

    app.use(function (req, res, next) {
        if (req.body) {
            console.log(req.body);
        } else {
            console.log('undefined req.body');
        }
        next();
    });

    require('./permissions')(app);

    // Routes
    var routes = {};
    require('./cruds')(app, routes);
    require('./dam')(app, routes);
    require('./upload')(app, routes);
}


