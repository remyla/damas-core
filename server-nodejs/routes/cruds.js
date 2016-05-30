/*
 * cruds.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, express) {
    var db = app.locals.db;
    //methodOverride = require('method-override'),
    var fs = require('fs');
    var events = require('../events');

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
                return httpStatus(res, 400, 'Create');
            }
            nodes[n].author = author;
            nodes[n].time = time;
        }

        events.fire('pre-create', nodes).then(function (data) {
            if (data.status) {
                return httpStatus(res, data.status, 'Create');
            }
            db.create(data.nodes || nodes, function (error, doc) {
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 409, 'Create');
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
        if (req.params.id) {
            var ids = req.params.id.split(',');
            var isArray = ids.length > 1;
        } else if (req.body) {
            var ids = req.body;
            var isArray = Array.isArray(ids);
            if (!isArray) {
                ids = [ids];
            }
        } else {
            return httpStatus(res, 400, 'Read');
        }
        if (ids.some(elem => typeof elem !== 'string')) {
            return httpStatus(res, 400, 'Read');
        }

        db.read(ids, function (error, doc) {
            if (error) {
                return httpStatus(res, 409, 'Read');
            }
            var response = getMultipleResponse(doc);
            if (response.fail) {
                httpStatus(res, 404, 'Read');
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
        var ids = req.params.id ? req.params.id.split(',') : false;
        var nodes = Array.isArray(req.body) ? req.body : [req.body];
        // Transform the nodes in update objects
        var ups = [];
        for (var i = 0; i < nodes.length; ++i) {
            if ('object' !== typeof nodes[i] || !(ids || nodes[i]._id) ||
                    0 === Object.keys(nodes[i]).length) {
                return httpStatus(res, 400, 'Update');
            }
            ups[i] = { _id: ids, set: {}, unset: {} };
            for (var key in nodes[i]) {
                if ('_id' === key) {
                    ups[i]._id = nodes[i][key];
                } else if (null === nodes[i][key] || '' === nodes[i][key]) {
                    ups[i].unset[key] = null;
                } else {
                    ups[i].set[key] = nodes[i][key];
                }
            }
        }
        events.fire('pre-update', ups).then(function (data) {
            if (data.status) {
                return httpStatus(res, data.status, 'Update');
            }
            db.update(data.nodes || ups, function (error, doc) {
                if (error) {
                    return httpStatus(res, 409, 'Update');
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'Update');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else {
                    httpStatus(res, 200, 1 === doc.length ? doc[0] : doc);
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
        if (req.params.id) {
            var ids = req.params.id.split(',');
        } else if (req.body) {
            var ids = Array.isArray(req.body) ? req.body : [req.body];
        } else {
            return httpStatus(res, 400, 'Remove');
        }
        if (ids.some(elem => typeof elem !== 'string')) {
            return httpStatus(res, 400, 'Remove');
        }
        events.fire('pre-remove', ids).then(function (data) {
            if (data.status) {
                return httpStatus(res, data.status, 'Remove');
            }
            db.remove(data.ids || ids, function (error, doc) {
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'Remove');
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
        if (req.params.id) {
            var ids = req.params.id.split(',');
        } else if (req.body) {
            var ids = Array.isArray(req.body) ? req.body : [req.body];
        } else {
            return httpStatus(res, 400, 'Graph');
        }
        if (ids.some(elem => typeof elem !== 'string')) {
            return httpStatus(res, 400, 'Graph');
        }

        db.graph(ids, function (error, nodes) {
            if (error) {
                return httpStatus(res, 409, 'Graph');
            }
            var response = getMultipleResponse(nodes);
            if (response.fail) {
                httpStatus(res, 404, 'Graph');
            } else if (response.partial) {
                httpStatus(res, 207, nodes);
            } else {
                httpStatus(res, 200, nodes); // We never need a single element
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
            return httpStatus(res, 400, 'Search');
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                httpStatus(res, 409, 'Search');
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
            return httpStatus(res, 400, 'Search_one');
        }
        q = decodeURIComponent(q);
        q = q.replace(/\s+/g, ' ').trim();
        db.searchFromText(q, function (error, doc) {
            if (error) {
                return httpStatus(res, 409, 'Search_one');
            }
            db.read([doc[0]], function (error, nodes) {
                if (error) {
                    httpStatus(res, 409, 'Search_one');
                } else {
                    httpStatus(res, 200, nodes[0]);
                }
            });
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
            return httpStatus(res, 501, 'Mongo');
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
                    if (0 === obj[key].indexOf('REGEX_')) {
                        obj[key] = new RegExp(obj[key].replace('REGEX_', ''));
                    }
                }
            }
        }
        prepare_regexes(query);
        db.mongo_search(query, sort, skip, limit, function (err, ids) {
            if (err) {
                httpStatus(res, 409, 'Search_mongo');
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
                if (0 === res.length) {
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
                return httpStatus(res, 404, 'File');
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
            case 409: e += 'Conflict'; break;
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
    app.put('/api/update', update);
    app.delete('/api/delete/:id', deleteNode);
    app.delete('/api/delete/', deleteNode);
    app.post('/api/delete/', deleteNode);

    // Search operations
    app.get('/api/search/:query(*)', search);
    app.get('/api/search_one/:query(*)', search_one);
    app.post('/api/search_mongo', search_mongo);
    app.get('/api/graph/', graph); // FIXME for the read error
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


