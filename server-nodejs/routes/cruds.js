/*
 * cruds.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express) {
    var db = app.locals.db;
    //methodOverride = require('method-override'),
    var fs = require('fs');
    var events = require('../events');
    var $sep = '<sep>';

    function getRequestIds(req, isArrayCallback) {
        if (req.params.id) {
            var ids = req.params.id.split($sep);
            var isArray = (ids.length > 1);
        } else if (req.body) {
            var isArray = Array.isArray(req.body);
            var ids = isArray ? req.body : [req.body];
        }
        if (!ids || ids.some(elem => typeof elem !== 'string')) {
            return false;
        }
        if ('function' === typeof isArrayCallback) {
            isArrayCallback(isArray);
        }
        return ids;
    }
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
            console.log('An error has occurred: '+ err);
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
        var isArray = Array.isArray(nodes);
        if (!isArray) {
            nodes = [nodes];
        }

        // Control properties
        var author = req.user.username || req.connection.remoteAddress;
        var time = Date.now();
        for (var n in nodes) {
            if ('object' !== typeof nodes[n]) {
                httpStatus(res, 400, 'create');
                return;
            }
            nodes[n].author = author;
            nodes[n].time = time;
        }

        events.fire('pre-create', nodes).then(function (data) {
            if (data.status) {
                httpStatus(res, data.status, 'create');
                return;
            }
            nodes = data.nodes || nodes;
            db.create(nodes, function (error, doc) {
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 409, 'create');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else {
                    httpStatus(res, 201, isArray ? doc : doc[0]);
                }
            });
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
        var isArray = false;
        var ids = getRequestIds(req, function (isIt) { isArray = isIt; });
        if (!ids) {
            return httpStatus(res, 400, 'Read');
        }

        db.read(ids, function (error, doc) {
            if (error) {
                httpStatus(res, 409, 'read');
                return;
            }
            var response = getMultipleResponse(doc);
            if (response.fail) {
                httpStatus(res, 404, 'read');
            } else if (response.partial) {
                httpStatus(res, 207, doc);
            } else {
                httpStatus(res, 200, isArray ? doc : doc[0]);
            }
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
        if (Object.keys(req.body).length === 0 || !req.params.id) {
            httpStatus(res, 400, 'update');
            return;
        }

        var ids = req.params.id.split($sep);
        var body = req.body;
        events.fire('pre-update', ids, body).then(function (data) {
            if (data.status) {
                httpStatus(res, data.status, 'create');
                return;
            }
            ids = data.ids || ids;
            body = data.body || body;
            db.update(ids, body, function (error, doc) {
                if (error) {
                    httpStatus(res, 409, 'update');
                    return;
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'update');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else {
                    httpStatus(res, 200, 1 < ids.length ? doc : doc[0]);
                }
            });
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
        var ids = getRequestIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Remove');
        }

        events.fire('pre-remove', ids).then(function (data) {
            if (data.status) {
                httpStatus(res, data.status, 'remove');
            }
            ids = data.ids || ids;
            db.remove(ids, function (error, doc) {
                console.log(doc);
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'remove');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else {
                    httpStatus(res, 200, 1 === doc.length ? doc[0] : doc);
                }
            });
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
        var ids = getRequestIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Graph');
        }

        db.graph(ids, function (error, nodes) {
            if (error) {
                httpStatus(res, 409, 'graph');
                return;
            }
            var response = getMultipleResponse(nodes);
            if (response.fail) {
                httpStatus(res, 404, 'graph');
            } else if (response.partial) {
                httpStatus(res, 207, nodes);
            } else {
                // We never need a single element
                httpStatus(res, 200, nodes);
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
     * - 400: Bad Request (not formatted correctly)
     */
    search = function (req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q == 'undefined') {
            httpStatus(res, 400, 'search');
            return;
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                httpStatus(res, 409, 'search');
            } else {
                httpStatus(res, 200, doc);
            }
        });
    }; // search()


    /*
     * search_one()
     *
     * Method: GET
     * URI: /api/search_one/
     *
     * Search for nodes in the database, returning the first matching object.
     *
     * HTTP status codes:
     * - 200: OK (search successful, even without results)
     * - 400: Bad Request (not formatted correctly)
     */
    search_one = function (req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q == 'undefined') {
            httpStatus(res, 400, 'search_one');
            return;
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                httpStatus(res, 409, 'search_one');
            } else {
                db.read([doc[0]], function (error, nodes) {
                    if (error) {
                        httpStatus(res, 409, 'search_one');
                    } else {
                        httpStatus(res, 200, nodes[0]);
                    }
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
        if (typeof db.mongo_search !== 'function') {
            httpStatus(res, 501, 'mongo');
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
                httpStatus(res, 409, 'search_mongo');
            } else {
                httpStatus(res, 200, ids);
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
        path = path.replace(/:/g, '').replace(/\/+/g, '/');
        fs.exists(path, function (exists) {
            if (!exists) {
                httpStatus(res, 404, 'file');
                return;
            }
            var stream = fs.createReadStream(path, {bufferSize: 64 * 1024});
            res.writeHead(200);
            stream.pipe(res);
        });
    }; // getFile()


    /**
     * Tells whether a response is failed or incomplete (contains null?)
     * @param {array} doc - the database response
     * @return {{fail: boolean, partial: boolean}} - the results to send
     */
    function getMultipleResponse(doc) {
        var result = { fail: true, partial: false };
        for (var i in doc) {
            if (null === doc[i]) {
                result.partial = true;
            } else {
                result.fail = false;
            }
        }
        return result;
    }

    function httpStatus(res, code, data) {
        res.status(code);
        if (code < 300) {
            res.json(data);
            return;
        }
        var e = data + ' error: ';
        switch (code) {
            case 400: e += 'Bad request (empty or not well-formed)'; break;
            case 401: e += 'Unauthorized (authentication required)'; break;
            case 403: e += 'Forbidden (permission required)'; break;
            case 404: e += 'Not found'; break;
            case 409: e += 'Conflict ()'; break;
            case 501: e += 'Not implemented (contact an administrator)'; break;
            default:  e += 'Unknown error code';
        }
        res.send(e);
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
    app.delete('/api/delete/', deleteNode);
    app.post('/api/delete/', deleteNode);

    // Search operations
    app.get('/api/search/:query(*)', search);
    app.get('/api/search_one/:query(*)', search_one);
    app.post('/api/search_mongo', search_mongo);
    app.get('/api/graph/', graph); // Fix
    app.get('/api/graph/:id', graph);
    app.post('/api/graph/', graph);

    // CRUD operations (deprecated)
    app.post('/api/', create);
    app.get('/api/:id', read);
    app.put('/api/:id', update);
    app.delete('/api/:id', deleteNode);

    // Extra operations
    app.get('/api/file/:path(*)', getFile); // untested
    app.post('/api/import', importJSON); // untested
    //app.get('/subdirs/:path', getSubdirs);
    //app.get('/subdirs', getSubdirs);
}


