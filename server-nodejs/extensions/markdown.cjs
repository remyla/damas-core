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
 * extension.
 */

module.exports = function (app){
    var debug = require('debug')('damas:extensions:markdown');

    async function import_marked_mjs() {
        const module = await import('./markdown.mjs');
        marked = module.default.marked;
    }
    import_marked_mjs();

    const fs = require('fs');
    /*
    const ejs = require('ejs');
    app.set('views', path.join(__dirname, 'ejs') );
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
    */

    var conf = app.locals.conf.markdown;

    // resolve path
    app.use('/', (req,res,next ) => {
        if(req.path.match(/.*\.md$/)) {
            // filename with explicit md extension: file in conf.root
            res.locals.translated_path = conf.root+req.path;
            debug('TRANSLATED_PATH FROM '+req.path+' TO '+res.locals.translated_path);
            return next();
        }
        for (var route in conf.routes) {
            // explicit path in conf.routes
            if (req.path === route){
                    res.locals.translated_path = conf.routes[route];
                    debug('TRANSLATED_PATH FROM '+req.path+' TO '+res.locals.translated_path);
                    return next();
            }
        }
        let filename = req.path.split('/').reverse()[0];
        if (-1 === filename.indexOf('.')) {
            // filename without extension: test if .md exists in conf.root
            fs.exists(conf.root+req.path+'.md', function(exists) {
                if (exists) {
                    console.log('file found render of file '+ req.path+'.md');
                    res.locals.translated_path = conf.root+req.path+'.md';
                    debug('TRANSLATED_PATH FROM '+req.path+' TO '+res.locals.translated_path);
                }
                return next();
            });

        } else {
            next();
        }
    });

    app.use('/', (req,res,next ) => {
        if(res.locals.translated_path !== undefined) {
            fs.readFile(res.locals.translated_path, 'utf8', function(err, data) {
                if(err) {
                  console.log(err);
                  res.send('not found');
                }
                else {
                    // remove the metadata embeded in between --- and ---
                    var data_processed = data.replace(/(^---[\s\S]*?)---/, '');
                    // find a document title, usually before = else use the file name
                    var title = res.locals.translated_path.split('/').reverse()[0].replace(/\.[^/.]+$/, "");
                    var m = data_processed.match(/([\s\S]*?)=/);
                    if (m && m[1] && m.index !== 0) {
                        title = m[1].trim();
                    }
                    var render = marked(data_processed.toString());
                    res.render(conf.template, { title: conf.title.replace('%s', title), content: render });
                }
            });
        }
        else {
            next();
        }
    });

}


