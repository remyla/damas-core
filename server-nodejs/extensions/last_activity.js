/*
 * last_activity.js
 */

/*
 * Keep the last activity at the format 'Date'
 * for current user in req.user.lastActivity
 */
module.exports = function (app) {
    app.use(function (req, res, next) {
        if ((undefined =! req.user) && req.user._id) {
            let lastActivity = Date.now();
            let usr = {'_id': req.user._id, 'lastActivity': lastActivity};
            app.locals.db.update([usr], function (err, nodes) {
            });
        };
        next();
    });
};

