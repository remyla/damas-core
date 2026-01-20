module.exports = function (app, routes) {
    const ejs = require('ejs');
    const path = require('node:path');
    const conf = app.locals.conf.ejs;
    app.set('views', conf.views);
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
}
