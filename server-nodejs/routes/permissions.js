/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
    var tools = require('./perms-tools.js')(app);
    var conf = app.locals.conf;

    app.use('/api/:route', function (req, res, next) {
        var copyReq = Array.from(Array.isArray(req.body) ? req.body : [req.body]);

        var isOperationAllowed = tools.isOperationAllowed(req.params.route, req.user.class);
        if(['read', 'update'].indexOf(req.params.route) === -1) {
            if(!isOperationAllowed) {
                return httpStatus(res, 403, 'Access ' + req.params.route);
            }
            next();
            return;
        }

        var ids = copyReq;
        if(['update'].indexOf(req.params.route) > -1) {
            ids = tools.extractIds(copyReq);
        }

        if(!conf.authorMode) {
            if(!isOperationAllowed) {
                return httpStatus(res, 403, 'Access ' + req.params.route);
            }
            next();
            return;
        }

        tools.filterByAuthor(ids, req.user.username, function(response) {
            if(req.user.class === 'admin') {
                next();
                return;
            }
            if(req.params.route !== 'read' && isOperationAllowed) {
                next();
                return;
            }
            var nodes = unfoldIds(copyReq);
            var result = tools.filterRequest(nodes, response);
            req.body = result;
            next();
        });
    }); //app.use()
};


