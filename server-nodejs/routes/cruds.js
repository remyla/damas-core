/*
 * cruds.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express) {
    var db = app.locals.db;
    //methodOverride = require('method-override'),
    var fs = require('fs');
    var multer = require('multer');

/*
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    //Handle errors
    app.use(function (err, req, res, next) {
        if (err) {
            console.log("An error has occurred: "+ err);
        } else {
            next();
        }
    });
*/

    /*
     * CRUD operations
     */


    /*
     * create()
     *
     * Method: PUT
     * URI: /api/
     *
     * Insert new nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes created)
     * - 400: Bad request (not formatted correctly)
     * ? 403: Forbidden (the user does not have the right permissions)
     * - 409: Conflict (some nodes already exist with these identifiers)
     */
    create = function (req, res) {
        var nodes = req.body;
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }

        // Control properties
        var author = req.user.username || req.connection.remoteAddress;
        var time = Date.now();
        for (var n in nodes) {
            if ('object' !== typeof nodes[n]) {
                res.status(400);
                res.send('create error: the body of the request is empty');
                return;
            }
            nodes[n].author = author;
            nodes[n].time = time;
        }

        db.create(nodes, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('Create error, please change your values');
                return;
            }
            // FIXME compatibility hack
            // Output in the same data type as the input
            if (Array.isArray(req.body)) {
                res.status(201);
                res.json(doc);
            } else {
                res.status(201);
                res.json(doc[0]);
            }
        });
    }; // create()


    /*
     * read()
     *
     * Method: GET
     * URI: /api/
     *
     * Retrieve the specified nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes retrieved)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the nodes do not exist)
     */
    read = function (req, res) {
        var id = req.params.id || req.body;
        if (!id) {
            res.status(400);
            res.send('read error: the specified id is not valid');
            return;
        }
        if (!Array.isArray(id)) {
            id = id.split(',');
        }
        db.read(id, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('read error, please change your values');
                return;
            }
            /*FIXME always return a non empty array
            if (0 === doc.length) {
                res.status(404);
                res.send('Id not found');
                return;
            }*/
            res.status(200);
            res.json(doc);
        });
    }; // read()


    /*
     * update()
     *
     * Method: PUT
     * URI: /api/
     *
     * Update existing nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes updated)
     * - 400: Bad request (not formatted correctly)
     * ? 403: Forbidden (the user does not have the right permissions)
     * - 404: Not Found (the nodes do not exist)
     */
    update = function (req, res) {
/*
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400);
            res.send('update error: the specified id is not valid');
            return;
        }
*/        if (Object.keys(req.body).length === 0) {
            res.status(400);
            res.send('update error: the body of the request is empty');
            return;
        }

        db.update(req.params.id.split(","), req.body, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('update error, please change your values');
                return;
            }
            res.status(200);
            res.json(doc);
        });
    }; // update()


    /*
     * deleteNode()
     *
     * Method: DELETE
     * URI: /api/
     *
     * Delete nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes deleted (or not found))
     * - 400: Bad request (not formatted correctly)
     * ? 403: Forbidden (the user does not have the right permissions)
     */
    deleteNode = function (req, res) {
        /* this check should not be based on ObjectId - disabled
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400);
            res.send('error: the specified id is not valid');
            return;
        }
        */
        db.remove(req.params.id.split(","), function (error, doc) {
            if (error) {
                res.status(409);
                res.send('delete error, please change your values');
                return;
            }
            res.status(200);
            res.send(doc.result.n + " documents deleted.");
        });
    }; // deleteNode()


    /*
     * graph()
     *
     * Method: GET
     * URI: /api/graph/
     *
     * Retrieve the graph of nodes by following the links targeting them
     *
     * HTTP status codes:
     * - 200: OK (graph retrieved)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the nodes do not exist)
     */
    graph = function (req, res) {
        var id = req.params.id || req.body.id;
        if (!id || id == "undefined") {
            res.status(400);
            res.send('Bad command');
            return;
        }
        //obsolete
        db.graph(id.split(","), function (error, nodes) {
            if (error) {
                res.status(409);
                res.send('graph error, please change your values');
                return;
            }
            if (nodes) {
                res.status(200);
                res.json(nodes);
            } else {
                res.status(404);
                res.send('Id not found');
            }
        });
    }; // graph()


    /*
     * search()
     *
     * Method: GET
     * URI: /api/search/
     *
     * Search for nodes in the database
     *
     * HTTP status codes:
     * - 200: OK (search successful, even without results)
     * - 400: Bad request (not formatted correctly)
     */
    search = function (req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q == "undefined") {
            res.status(400);
            res.send('Bad command');
            return;
        }
        q = q.replace(/\s+/g, ' ').trim();
        //q = q.replace('< ', '<');
        //q = q.replace('<= ', '<=');
        //q = q.replace('>= ', '>=');
        //q = q.replace('> ', '>');
        //q = q.replace(': ', ':');
        var terms = q.split(" ");
        var pair;
        var result = {};
        //var j;
        //var tempField;
        for (var i = 0; i< terms.length; i++) {
            if (terms[i].indexOf('<=') > 0) {
                pair = terms[i].split('<=');
                result[pair[0]] = {$lte: decodeURIComponent(pair[1])};
                continue;
            }
            if (terms[i].indexOf('<') > 0) {
                pair = terms[i].split('<');
                result[pair[0]] = {$lt: decodeURIComponent(pair[1])};
                continue;
            }
            if (terms[i].indexOf('>=') > 0) {
                pair = terms[i].split('>=');
                result[pair[0]] = {$gte: decodeURIComponent(pair[1])};
                continue;
            }
            if (terms[i].indexOf('>') > 0) {
                pair = terms[i].split('>');
                result[pair[0]] = {$gt: decodeURIComponent(pair[1])};
                continue;
            }
            if (terms[i].indexOf(':') > 0) {
                pair = terms[i].split(':');
                var value = decodeURIComponent(pair[1]);

                var flags = value.replace(/.*\/([gimy]*)$/, '$1');
                var pattern = value.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                if (flags != value && pattern != value) {
                    var regex = new RegExp(pattern, flags);
                    result[pair[0]] = regex;
                } else {
                    result[pair[0]] = value;
                }
/*
                for (j = 1;j<pair.length-1;j++)
                    result[tempField] += decodeURIComponent(pair[j]) + ":";
                if (pair[j] != '')
                    result[tempField] += decodeURIComponent(pair[j]);
*/
                continue;
            }
/* implement full text search
            result['$where'] = function () {
                for (var key in this) {
                    if (this[key])
                }
            }
db.things.find({$where: function () {
  for (var key in this) {
    if (this[key] === "bar") {
      return true;
    }
    return false;
    }
}});
*/
/*
            if (i == 0) {
                continue;
            }
            if (result[tempField] != '') {
                result[tempField] += " " + terms[i];
            } else {
                result[tempField] += terms[i];
            }
*/
        }
        db.search(result, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('Read Error, please change your values');
                return;
            }
            res.status(200);
            res.json(doc);
        });
    }; // search()


    /*
     * search_mongo()
     *
     * Method: POST
     * URI: /api/search_mongo/
     *
     * Perform a research specific to the MongoDB database engine
     *
     * HTTP status codes:
     * - 200: OK (search successful, even without results)
     * - 400: Bad request (not formatted correctly)
     * - 501: Not Implemented (MongoDB not in use)
     */
    search_mongo = function (req, res) {
        if (typeof db.mongo_search !== "function") {
            res.status(409);
            res.send('MongoDB not in use');
            return;
        }
        var query, sort, limit, skip;
        if (req.body.queryobj) {
            var data = JSON.parse(req.body.queryobj);
            query =  data.query;
            sort =  data.sort;
            limit =  data.limit | 0;
            skip =  data.skip | 0;
        } else {
            query = req.body.query;
            sort = req.body.sort;
            limit = req.body.limit | 0;
            skip = req.body.skip | 0;
        }
        function prepare_regexes(obj) {
            for (var key in obj) {
                if ('object' === typeof obj[key] && null !== obj[key]) {
                    prepare_regexes(obj[key]);
                    continue;
                }
                if ('string' === typeof obj[key]) {
                    if (obj[key].indexOf('REGEX_') === 0) {
                        obj[key] = new RegExp(obj[key].replace('REGEX_', ''));
                    }
                }
            }
        }
        prepare_regexes(query);
        db.mongo_search(query, sort, skip, limit, function (err, ids) {
            if (err) {
                res.status(409);
                res.send('mongodb find error');
            } else {
                res.status(200);
                res.json(ids);
            }
        });
    }; // search_mongo()


    /**
     * Import a JSON graph commit from our current Php Server
     *
     */
    importJSON = function (req, res) {
        var json = JSON.parse(req.body.text);
        json.nodes.forEach(function (node, i, nodes) {
            var keys = node.keys;
            keys.mysqlid = node.id;
            db.search({mysqlid:keys.mysqlid}, function (err, res) {
                if (err) {
                    console.log('ERROR');
                    return;
                }
                if (res.length === 0) {
                    db.create(keys, function (err, n) {
                        if (err) console.log('ERROR create')
                    });
                } else {
                    console.log('found mysqlid:' + keys.mysqlid);
                }
                if (i === nodes.length - 1) { // we finished inserting nodes
                    json.links.forEach(function (link) {
                        console.log(link);
                        db.search({mysqlid:link.src_id.toString()},
                                function (err, res1) {
                            if (err) {
                                console.log('LINK ERR');
                                return;
                            }
                            db.search({mysqlid:link.tgt_id.toString()},
                                    function (err, res2) {
                                if (err) {
                                    console.log('LINK ERR');
                                    return;
                                }
                                db.create({src_id: res1[0], tgt_id: res2[0]},
                                        function () {});
                            });
                        });
                    });

                }
            })
        }, json);
        res.status(200);
        res.send();
    }; // importJSON()


    /*
     * getFile()
     *
     * Method: GET
     * URI: /api/file/
     *
     * Get a file from the filesystem
     *
     * HTTP status codes:
     * - 200: OK (file retrieved)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the file does not exist)
     */
    getFile = function (req, res) {
        var path = fileSystem + decodeURIComponent(req.params.path);
        path = path.replace(/:/g, "").replace(/\/+/g, "/");
        fs.exists(path, function (exists) {
            if (!exists) {
                res.status(404);
                res.send('File not found');
                return;
            }
            var stream = fs.createReadStream(path, {bufferSize: 64 * 1024});
            res.writeHead(200);
            stream.pipe(res);
        });
    }; // getFile()


    /*
     * Register the operations
     */

    // CRUDS operations
    app.post('/api/create/', create);
    app.post('/api/read/', read);
    app.put('/api/update/:id', update);
    app.delete('/api/delete/:id', deleteNode);

    // Old CRUDS operations
    app.post('/api/', create);
    app.get('/api/:id', read);
    app.put('/api/:id', update);
    app.delete('/api/:id', deleteNode);

    // Extra operations
    app.get('/api/graph/:id', graph);
    app.get('/api/file/:path(*)', getFile); // untested
    app.post('/api/import', importJSON); // untested
    //app.get('/subdirs/:path', getSubdirs);
    //app.get('/subdirs', getSubdirs);

    // Alternative Operations
    app.get('/api/search/:query(*)', search);
    app.post('/api/search_mongo', search_mongo);
    app.get('/api/graph/', graph);
    app.get('/api/read/:id', read);
    //app.put('/', update);
    //app.delete('/', deleteNode);
}


