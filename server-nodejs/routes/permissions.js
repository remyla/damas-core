/*
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
    app.use('/api/:route', function (req, res, next) {
        switch (req.params.route) {
        case 'lock':
        case 'unlock':
        case 'publish':
        case 'upload':
        case 'version':
        case 'file':
            // User class must be at least 'user'
            if (['user', 'editor', 'admin'].indexOf(req.user.class) === -1) {
                return httpStatus(res, 403, 'Access ' + req.params.route);
            }
            break;
        case 'create':
        case 'update':
        case 'delete':
            // User class must be at least 'editor'
            if (['editor', 'admin'].indexOf(req.user.class) === -1) {
                return httpStatus(res, 403, 'Edition');
            }
            break;
        }
        next();
    });
};


