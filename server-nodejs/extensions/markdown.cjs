/**
 * middleware to intercept requests asking to serve a .md file, instead
 * serve a rendered html using the marked markdown module.
 *
 * This module is divided in 2 files: markdown.cjs and markdown.mjs
 * because marked is a ES6 module which can't be dynamically loaded
 * so we load it from this CommonJS module. This way, the middleware
 * will be loaded using the order specified in the json config. The
 * ES6 module underneath will still be loaded asynchronously but we
 * expect it will be fully loaded and operationnal before the first
 * access requesting to render a .md file
 *
 * This module uses EJS to build the html using templates. EJS can be
 * activated outside this module for flexibility, activate the ejs.js
 * extension. The ejs template is specified in conf. 3 variables are passed
 * to the template: title, path, content.
 *
 * Resolves routes, directory README.md and file .md extension autocompletion.
 */

module.exports = function (app){
    var debug = require('debug')('damas:extensions:markdown');

    async function import_marked_mjs() {
        const module = await import('./markdown.mjs');
        marked = module.default.marked;
    }
    import_marked_mjs();

    const fs = require('fs');
    /* // ejs is now an as an external module
    const ejs = require('ejs');
    app.set('views', path.join(__dirname, 'ejs') );
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
    */

    var conf = app.locals.conf.markdown;

    // path resolver
    app.use('/', (req,res,next ) => {
        if (0 === req.path.indexOf('/api/')) {
            return next();
        }
        for (var route in conf.routes) {
            if (0 === req.path.indexOf(route)) {
                res.locals.resolved_path = req.path.replace(route, conf.routes[route]);
                if (res.locals.resolved_path.endsWith("/")) {
                    res.locals.resolved_path = res.locals.resolved_path+'README.md';
                    return next();
                }
                if (-1 === res.locals.resolved_path.split("/").reverse()[0].indexOf(".")) {
                    res.locals.resolved_path += ".md";
                    return next();
                }
            }
        }
        next();
    });

    app.use('/', (req,res,next ) => {
        if(res.locals.resolved_path !== undefined) {
            debug(req.path+' resolved to '+res.locals.resolved_path);
            if(res.locals.resolved_path.endsWith('.md')) {
                fs.readFile(res.locals.resolved_path, 'utf8', function(err, data) {
                    if(err) {
                      res.send('not found');
                    }
                    else {
                        // remove the metadata embeded in between --- and ---
                        var data_processed = data.replace(/(^---[\s\S]*?)---/, '');
                        // find a document title, usually before = else use the file name
                        var title = res.locals.resolved_path.split('/').reverse()[0].replace(/\.[^/.]+$/, "");
                        var m = data_processed.match(/([\s\S]*?)===/);
                        if (null != m) {
                            if (m[1]) {
                                title = m[1].trim();
                            }
                        }
                        var render = marked(data_processed.toString());
                        res.render(conf.template, {
                            title: conf.title.replace('%s', title),
                            path: req.path,
                            content: render });
                    }
                });
            } else {
                // we translated a path, but it is not a .md
                // so we can serve the images,css:
                // res.sendFile(res.locals.resolved_path);
                // or we let the following express static middleware serve the other files:
                next();
            }
        }
        else {
            next();
        }
    });

}


