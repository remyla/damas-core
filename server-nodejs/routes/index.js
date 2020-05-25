/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf;
    var debug = require('debug')('damas:body');
    require('./utils');

    app.use(function (req, res, next) {
        if (req.body) {
            debug(req.body);
        } else {
            debug('undefined req.body');
        }
        next();
    });

    require('./permissions')(app);

    // Routes
    var routes = {};
    require('./cruds')(app, routes);
}


