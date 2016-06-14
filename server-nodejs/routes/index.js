/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express){
    var conf = app.locals.conf;
    var debug = require('debug')('app:init');
    require('./utils');

    var bodyParser = require( 'body-parser' );
    app.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );
    app.use( bodyParser.json({limit: '50mb', strict: false}));

    var morgan = require('morgan');
    app.use(morgan('dev'));

    app.use(function (req, res, next) {
        if (req.body) {
            console.log(req.body);
        } else {
            console.log('undefined req.body');
        }
        next();
    });

    //Static routes
    for (var route in conf.publiclyServedFolders) {
        app.use(express.static(conf.publiclyServedFolders[route]));
    }

    // Authentication
    if (conf.auth === 'jwt') {
        require('./auth-jwt-node.js')(app);
        debug("Authentification is JWT");
    } else {
        require('./auth-none.js')(app);
        debug('Warning: No authentication.');
        debug('Edit conf.json and set auth=jwt to enable json web tokens');
    }
    require('./permissions')(app);

    // Routes
    require('./dam')(app);
    require('./cruds')(app);
    require('./upload')(app);
}


