module.exports = function (app) {
    var conf = app.locals.conf.restricted_keys;

    /**
     * Replace keys by default ones if the user class is not in the whitelist
     * If the new value is defined as null, delete the key from the request
     */
    app.use('/api/', function (req, res, next) {
        if (conf.whitelist.indexOf(req.user.class) !== -1) {
            next();
            return;
        }

        if (Array.isArray(req.body)) {
            for (var i in req.body) {
                req.body[i] = override(req.body[i]);
            }
        } else {
            req.body = override(req.body);
        }

        next();
    });

    function override(node) {
        Object.keys(node).forEach(function (key) {
            var newValue = conf.override[key];
            if (newValue !== undefined) {
                if (newValue === null) {
                    delete node[key];
                    return;
                }
                node[key] = newValue;
            }
        });
        return node;
    }
}
