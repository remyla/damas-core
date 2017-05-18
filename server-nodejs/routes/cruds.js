/*
 * cruds.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, routes) {
    var db = app.locals.db;
    var conf = app.locals.conf;
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
        var nodes = Array.isArray(req.body) ? req.body : [req.body];

        var controlProperties = {
            author: req.user.username,
            time: Date.now()
        }
        for (var i = 0; i < nodes.length; ++i) {
            if ('object' !== typeof nodes[i] || null === nodes[i]) {
                return httpStatus(res, 400, 'Create');
            }
            nodes[i] = Object.assign({}, controlProperties, nodes[i]);
        }
        nodes = unfoldIds(nodes);

        events.fire('pre-create', nodes).then(function (data) {
            if (data.status) {
                return httpStatus(res, data.status, 'Create');
            }
            db.create(data.nodes || nodes, function (error, doc) {
                if (error) {
                    return httpStatus(res, 409, 'Create');
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 409, 'Create');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else if (1 === doc.length && !isArray(req)) {
                    httpStatus(res, 201, doc[0]);
                } else {
                    httpStatus(res, 201, doc);
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
        var ids = getRequestIds(req);
        if (!ids) {
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
            } else if (1 === doc.length && !isArray(req)) {
                httpStatus(res, 200, doc[0]);
            } else {
                httpStatus(res, 200, doc);
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
        function checkObject(obj) {
            // Needs at least 2 keys, _id + a key to update
            return 'object' === typeof obj && 1 < Object.keys(obj).length;
        }
        var nodes = Array.isArray(req.body) ? req.body : [req.body];
        for (var i = 0; i < nodes.length; ++i) {
            if (!checkObject(nodes[i]) || !nodes[i]._id) {
                return httpStatus(res, 400, 'Update');
            }
        }
        nodes = unfoldIds(nodes);
        events.fire('pre-update', nodes).then(function (data) {
            if (data.status) {
                return httpStatus(res, data.status, 'Update');
            }
            db.update(data.nodes || nodes, function (error, doc) {
                if (error) {
                    return httpStatus(res, 409, 'Update');
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'Update');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else if (1 === doc.length && !isArray(req)) {
                    httpStatus(res, 200, doc[0]);
                } else {
                    httpStatus(res, 200, doc);
                }
            });
        });
    }; // update()

    /*
     * upsert()
     *
     * Method: POST 
     * URI: /api/upsert/
     *
     * Insert new nodes or update already existing nodes
     *
     * HTTP status codes:
     * - 200: OK (nodes inserted and/or updated)
     * - 400: Bad request (not formated correctly)
     */
    upsert = function (req, res) {
        var nodes = Array.isArray(req.body) ? req.body : [req.body];
        var controlProperties = {
            author: req.user.username,
            time: Date.now()
        }
        for (var i = 0; i < nodes.length; ++i) {
            if ('object' !== typeof nodes[i] || null === nodes[i]) {
                return httpStatus(res, 400, 'Upsert');
            }
            nodes[i] = Object.assign({}, controlProperties, nodes[i]);
        }
        nodes = unfoldIds(nodes);
        for(var i in nodes) {
            if(nodes[i]._id === 'null') {
                delete nodes[i]._id;
            }
        }

        db.create(nodes, function(err, result) {
            if(err) {
                return httpStatus(res, 409, 'Upsert');
            }
            var toUpdate = [];
            var created = [];
            for(var i in nodes) {
                if(result[i] === null) {
                    toUpdate.push(nodes[i]);
                }
                else {
                    created.push(nodes[i]);
                }
            }
            var response = getMultipleResponse(result);
            if (response.fail) {
                db.update(nodes, function(err, updates) {
                    if(err) {
                        return httpStatus(res, 409, 'Upsert');
                    }
                    httpStatus(res, 200, (updates.length > 1) ? updates : updates[0]);
                });
                return;
            }
            if (response.partial) {
                db.update(toUpdate, function(err, updates) {
                    if (err) {
                        return httpStatus(res, 409, 'Upsert');
                    }
                    var output = created.concat(updates);
                    httpStatus(res, 200, output);
                });
                return;
            }
            if (toUpdate.length === 0) {
                httpStatus(res, 200, (created.length > 1) ? result : result[0]);
                return;
            }
        });
    }; // upsert()


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
        var ids = getBodyIds(req);
        if (!ids) {
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
                } else if (1 === doc.length && !isArray(req)) {
                    httpStatus(res, 200, doc[0]);
                } else {
                    httpStatus(res, 200, doc);
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
        var depth = req.params.depth || 0;
        var ids = getRequestIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Remove');
        }

        db.graph(ids, depth, function (error, nodes) {
            if (error) {
                return httpStatus(res, 409, 'Graph');
            }
            var response = getMultipleResponse(nodes);
            if (response.fail) {
                httpStatus(res, 404, 'Graph');
            } else if (response.partial) {
                httpStatus(res, 207, nodes);
            } else {
                httpStatus(res, 200, nodes); // Always send an array for graph
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
                httpStatus(res, 200, doc); // Always send an array for search
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
                        continue;
                    }
                    if (0 === obj[key].indexOf('RX_')) {
                        var delimiter = obj[key].lastIndexOf('_RX');
                        var exp, opt;
                        if(-1 === delimiter) {
                            exp = obj[key].substring(3);
                            opt = '';
                        }
                        else {
                            exp = obj[key].substring(3, delimiter);
                            opt = obj[key].substring(delimiter + 3);
                        }
                        obj[key] = new RegExp(exp, opt);
                    }
                }
            }
        }
        prepare_regexes(query);
        db.mongo_search(query, sort, skip, limit, function (err, ids) {
            if (err) {
                httpStatus(res, 409, 'Search_mongo');
            } else {
                //res.setHeader('total', ids.total);
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
                    return console.log('ERROR');
                }
                if (0 === res.length) {
                    db.create([keys], function (err, n) {
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
                                db.create([{src_id: res1[0], tgt_id: res2[0]}],
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
        var path = conf.fileSystem + decodeURIComponent(req.params.path);
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


    /*
     * Register the operations
     */

    // CRUD operations using nodes
    app.post('/api/create/', create);
    app.put('/api/update/', update);
    app.post('/api/upsert/', upsert);

    // CRUD operations using ids
    app.get('/api/read/:id(*)', read);
    app.post('/api/read/', read);
    app.delete('/api/delete/', deleteNode);
    app.get('/api/graph/:depth/:id(*)', graph);
    app.post('/api/graph/:depth', graph);

    // Search operations
    app.get('/api/search/:query(*)', search);
    app.get('/api/search_one/:query(*)', search_one);
    app.post('/api/search_mongo/', search_mongo);

    // Extra operations
    app.get('/api/file/:path(*)', getFile); // untested
    app.post('/api/import/', importJSON); // untested
    //app.get('/subdirs/:path', getSubdirs);
    //app.get('/subdirs', getSubdirs);

    routes = Object.assign(routes, {
        create: create,
        read: read,
        update: update,
        upsert: upsert,
        deleteNode: deleteNode,
        graph: graph,
        search: search,
        search_one: search_one,
    });
}


