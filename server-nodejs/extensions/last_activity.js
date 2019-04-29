/*
 * last_activity.js
 */

/*
 * Keep the last activity at the format 'Date'
 * for current user in req.user.lastActivity
 */
module.exports = function (app) {
	app.use(function (req, res, next) {
		if(req.connection.remoteAddress === req.user.username){
			console.warn('no user connected');
			next();
		} else if (undefined != req.user) {					
			let lastActivity = Date.now();
			let usr = {'_id': req.user._id, 'lastActivity': lastActivity};
			let db = app.locals.db;
			db.update([usr], function(err, nodes){
			});
			next();
		};
	});
};
