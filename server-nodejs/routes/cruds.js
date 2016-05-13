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
     * Method: POST
     * URI: /api/create/
     *
     * Insert new nodes
     *
     * HTTP status codes:
     * - 201: Created (nodes created)
     * - 207: Multi-Status (some nodes already exist with these identifiers)
     * - 400: Bad request (not formatted correctly)
     * - 409: Conflict (all nodes already exist with these identifiers)
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
                res.send('create error: the specified elements must be objects');
                return;
            }
            nodes[n].author = author;
            nodes[n].time = time;
        }

        db.create(nodes, function (error, doc) {
            if(Array.isArray(req.body)) {
                //in the case Create's doc is unified
                var response = getMultipleResponse(doc);
                if (response.err && response.partial) {
                    res.status(207);
                    res.json(doc);
                    return;
                }
                res.status(201);
                res.json(doc);
                return;
            }
            if (error) {
                res.status(409);
                res.send('Create error, please change your values');
                return;
            }
            res.status(201);
            res.json(doc[0]);
        });
    }; // create()


    /*
     * read()
     *
     * Method: GET
     * URI: /api/read/
     *
     * Retrieve the specified nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes retrieved)
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
     */
    read = function (req, res) {
        var id = req.params.id || req.body;
        if (!id) {
            res.status(400);
            res.send('read error: the specified id is not valid');
            return;
        }
        var idIsArray = Array.isArray(id);
        if (!idIsArray) {
            id = id.split(',');
        }
        db.read(id, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('read error, please change your values');
                return;
            }

            if(idIsArray) {
                var response = getMultipleResponse(doc);
                if (response.err) {
                    if(response.partial) {
                        res.status(207);
                        res.json(doc);
                        return;
                    }
                    res.status(404);
                    res.send('No id found');
                    return;
                }
                res.status(200);
                res.json(doc);
                return;
            } else if (null === doc[0]) {
                res.status(404);
                res.send('Id not found');
                return;
            }
            res.status(200);
            res.json(doc[0]);
        });
    }; // read()


    /*
     * update()
     *
     * Method: PUT
     * URI: /api/update/
     *
     * Update existing nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes updated)
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
     */
    update = function (req, res) {
        if (Object.keys(req.body).length === 0) {
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

            if(1 < req.params.id.split(',').length) {
                var response = getMultipleResponse(doc);
                if (response.err) {
                    if(response.partial) {
                        res.status(207);
                        res.json(doc);
                        return;
                    }
                    res.status(404);
                    res.send('No id found');
                    return;
                }
                res.status(200);
                res.json(doc);
                return;
            } else if (null === doc[0]) {
                res.status(404);
                res.send('Id not found');
                return;
            }
            res.status(200);
            res.json(doc[0]);
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
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
     */
    deleteNode = function (req, res) {
        /* this check should not be based on ObjectId - disabled
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400);
            res.send('error: the specified id is not valid');
            return;
        }
        */
        var ids = req.params.id.split(',');
        db.remove(ids, function (error, doc) {
            if (error) {
                res.status(404);
                res.send('delete error, please change your values');
                return;
            }
            if (ids.length === doc.result.n) {
                res.status(200);
            } else {
                res.status(207);
            }
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
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
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
            if(Array.isArray(id)) {
                var response = getMultipleResponse(nodes);
                if (response.err) {
                    if(response.partial) {
                        res.status(207);
                        res.json(nodes);
                        return;
                    }
                    res.status(404);
                    res.send('No id found');
                    return;
                }
                res.status(200);
                res.json(nodes);
                return;
            } else if (null === nodes[0]) {
                res.status(404);
                res.send('Id not found');
                return;
            }
            res.status(200);
            res.json(nodes[0]);
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
     * - 400: Bad Request (not formatted correctly)
     */
    search = function (req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q == "undefined") {
            res.status(400);
            res.send('Bad command');
            return;
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('search error, please change your values');
                return;
            }
            res.status(200);
            res.json(doc);
        });
    }; // search()


    /*
     * search_one()
     *
     * Method: GET
     * URI: /api/search_one/
     *
     * Search for nodes in the database, returning the first matching occurrence
     * as a node object.
     *
     * HTTP status codes:
     * - 200: OK (search successful, even without results)
     * - 400: Bad Request (not formatted correctly)
     */
    search_one = function (req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q == "undefined") {
            res.status(400);
            res.send('Bad command');
            return;
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('search_one error, please change your values');
                return;
            }
            res.status(200);
            if (doc.length === 0) {
                res.json(null);
            } else {
                db.read([doc[0]], function(error, node) {
                    if (error) {
                        res.status(409);
                        res.send('read error, please change your values');
                        return;
                    }
                    res.status(200);
                    res.json(node[0]);
                });
            }
        });
    }; // search_one()


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
     * - 400: Bad Request (not formatted correctly)
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
     * - 400: Bad Request (not formatted correctly)
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


    /**
     * Sets the appropriate response and status code for multiple params or not
     * @param {boolean} isArray - did client sent an array or not
     * @param {array} doc - the database response
     * @param {} result - the returned object or string
     * @return {{status: number, content: result}} - the results to send
     */
    function getMultipleResponse(doc) {
        var result = {};
        var errorCount = 0;
        for (i in doc) {
            if (null === doc[i]) {
                ++errorCount;
            }
        }
        if (0 < errorCount) {
            result.err = true;
            result.partial = true;
            if (doc.length === errorCount) {
                result.partial = false;
            }
            return result;
        }
        result.err = false;
        return result;
    }


    /*
     * Register the operations
     */

    // CRUD operations
    app.post('/api/create/', create);
    app.get('/api/read/:id', read);
    app.post('/api/read/', read);
    app.put('/api/update/:id', update);
    app.delete('/api/delete/:id', deleteNode);

    // Search operations
    app.get('/api/search/:query(*)', search);
    app.get('/api/search_one/:query(*)', search_one);
    app.post('/api/search_mongo', search_mongo);
    app.get('/api/graph/', graph);

    // CRUD operations (deprecated)
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
}


