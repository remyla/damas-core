/*
 * http redirected to https unless for letsencrypt authentication files
 */
module.exports = function (app) {

    var redirect = function () {
        var func = function(req, res, next) {
            if(!req.secure) {
                return res.redirect(['https://', req.get('Host'), req.url].join(''));
            }
            next();
        };
        func.unless = require('express-unless');
        return func;
    }

    app.use(redirect().unless({path:/\/.well-known\//}));
}
