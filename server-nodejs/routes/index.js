module.exports = function (app, express){
	var conf = app.locals.conf;
	var debug = require('debug')('app:init');

	var bodyParser = require( 'body-parser' );
	app.use( bodyParser.urlencoded( { limit: '50mb', extended : true } ) );
	app.use( bodyParser.json({limit: '50mb', strict: false}));

	var morgan = require('morgan');
	app.use(morgan('dev'));

	app.use( function(req, res, next)
	{
		if (req.body)
			console.log(req.body);
		else
			console.log('undefined req.body');
		next();
	});
	//Static routes
	for(var route in conf.publiclyServedFolders)
	{
		app.use( express.static( conf.publiclyServedFolders[route] ) );
	}
	if (conf.auth === 'jwt')
	{
		require('./auth-jwt-node.js')(app);
		debug("Authentification is JWT");
	}
	else {
		require('./auth-none.js')(app);
		debug("Warning: No authentication. Edit conf.json and set auth=jwt to enable json web tokens");
	}
	require('./dam')(app);
	require('./cruds')(app);
	require('./upload')(app);

	// Shortcuts
	app.get('/console', function( req, res ){
		res.sendFile('console.html', { root: '../public' });
	});
}
