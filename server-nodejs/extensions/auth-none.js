module.exports = function(app){
    var debug = require('debug')('damas:extensions:authentication');
    debug('Warning: No authentication.');
    debug('Edit conf.json and enable jwt extension to use json web tokens');
    app.use(function(req, res, next ){
        req.user = {
            username: req.connection.remoteAddress,
            address: req.connection.remoteAddress,
            class: 'admin'
        }
        next();
    });
    app.get("/api/verify", function (req, res) {
        return res.status(200).json({});
    });
}


