/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
    var tools = require('./perms-tools.js')(app);
    var conf = app.locals.conf;

    app.use('/api/:route', function (req, res, next) {
        var copyReq = Array.from(Array.isArray(req.body) ? req.body : [req.body]);

        var isFromClass = tools.isFromClass(req);
        if(['read', 'update'].indexOf(req.params.route) === -1) {
            if(!isFromClass) {
                return httpStatus(res, 403, 'Access ' + req.params.route);
            }
            next();
            return;
        }

        var ids = copyReq;
        if(['update'].indexOf(req.params.route) > -1) {
            ids = tools.extractIds(copyReq);
        }
        tools.filterByAuthor(ids, req.user.username, function(response) {
            if(conf.authorMode) {
                if(req.user.class === 'admin') {
                    next();
                    return;
                }
                var nodes = unfoldIds(copyReq);
                var result = tools.filterRequest(nodes, response);
                if(!isFromClass || req.params.route === 'read') {
                    req.body = result;
                }
                next();
            }
            else {
                if(!isFromClass) {
                    return httpStatus(res, 403, 'Access ' + req.params.route);
                }
                next();
            }
        });
    }); //app.use()
};


