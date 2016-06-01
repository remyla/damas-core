/*
 * dam.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
    var db = app.locals.db;
    require('./utils');


    /*
     * Method: PUT
     * URI: /api/lock/
     *
     * Attempt to lock an asset
     *
     * HTTP status codes:
     * - 200: OK (asset locked correctly by the current user)
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
     * - 409: Conflict (asset already locked by someone else)
     */
    lock = function (req, res) {
        var ids = getRequestIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Lock');
        }

        var n = db.read(ids, function (err, nodes) {
            if (err) {
                return httpStatus(res, 409, 'Lock');
            }
            var user = req.user.username || req.connection.remoteAddress;
            for (var i = 0; i < nodes.length; ++i) {
                if (null === nodes[i]) {
                    continue;
                }
                if (undefined !== nodes[i].lock && user !== nodes[i].lock) {
                    return httpStatus(res, 409, 'Lock');
                }
            }
            db.update([{_id: ids, lock: user}], function (error, doc) {
                if (error) {
                    return httpStatus(res, 409, 'Lock');
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'Lock');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else if (1 === doc.length && !isArray(req)) {
                    httpStatus(res, 200, doc[0]);
                } else {
                    httpStatus(res, 200, doc);
                }
            });
        });
    };


    /*
     * Method: PUT
     * URI: /api/unlock/
     *
     * Attempt to unlock an asset
     *
     * HTTP status codes:
     * - 200: OK (asset unlocked correctly)
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the asset does not exist)
     * - 409: Conflict (asset locked by someone else)
     */
    unlock = function (req, res) {
        var ids = getRequestIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Unlock');
        }

        var n = db.read(ids, function (err, nodes) {
            if (err) {
                return httpStatus(res, 409, 'Unlock');
            }
            var user = req.user.username || req.connection.remoteAddress;
            for (var i = 0; i < nodes.length; ++i) {
                if (null === nodes[i]) {
                    continue;
                }
                if (undefined !== nodes[i].lock && user !== nodes[i].lock) {
                    return httpStatus(res, 409, 'Unlock');
                }
            }
            db.update([{_id: ids, lock: null}], function (error, doc) {
                if (error) {
                    return httpStatus(res, 409, 'Unlock');
                }
                var response = getMultipleResponse(doc);
                if (response.fail) {
                    httpStatus(res, 404, 'Unlock');
                } else if (response.partial) {
                    httpStatus(res, 207, doc);
                } else if (1 === doc.length && !isArray(req)) {
                    httpStatus(res, 200, doc[0]);
                } else {
                    httpStatus(res, 200, doc);
                }
            });
        });
    };


    /*
     * Method: POST
     * URI: /api/version/
     *
     * Create a new version of the specified node (as a child node)
     *
     * HTTP status codes:
     * - 201: OK (version created correctly)
     * - 400: Bad request (not formatted correctly)
     * - 409: Conflict (asset locked by someone else)
     */
    version = function (req, res) {
        var keys = req.body;
        if (!keys.file) {
            return httpStatus(res, 400, 'Version');
        }
        keys.author = req.user.username || req.connection.remoteAddress;
        keys.time = Date.now();
        keys['#parent'] = req.params.id;
        db.create(keys, function (error, doc) {
            if (error) {
                return httpStatus(res, 409, 'Version');
            }
            httpStatus(res, 201, doc[0]);
        });
    };

    /* this is added as comment because we will implement this route

    /*
     * Method: POST
     * URI: /api/link/
     *
     * Create a link between two nodes
     *
     * HTTP status codes:
     * - 200: OK (link created correctly)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the source and/or the target does not exist)

    app.post('/api/link', function (req, res) {
        if (!req.body.target) {
            console.log('link error: target must be specified');
            res.status(400);
            res.send('link error: target must be specified');
            return;
        }
        if (!req.body.sources) {
            console.log('link error: sources must be specified');
            res.status(400);
            res.send('link error: sources must be specified');
            return;
        }
        var sources = req.body.sources
        var keys = req.body.keys || {}
        var result = [];
        keys.author = req.user.username || req.connection.remoteAddress;
        keys.time = Date.now();
        mod.search({file:req.body.target}, function (err, res) {
            if (err) {
                console.log('link error: target path not found');
                res.status(400);
                res.send('link error: target path not found');
                return;
            }
            var tgt_id = res[0]
            console.log('tgt_id='+tgt_id)
            for( var i=0; i<sources.length; i++) {
                mod.search({file:sources[i]}, function (err, res) {
                    if (err || res.length === 0) {
                        console.log('not found');
                        return;
                    }
                    console.log(res[0])
                    var new_node = {'tgt_id': tgt_id, 'src_id': res[0]};
                    for (var attrname in keys) { new_node[attrname] = keys[attrname] }
                    mod.create(new_node, function (err, res) {
                        console.log(res);
                        result.push(res._id.toString());
                    })
                })
            }
        })
        res.status(200);
        res.json(result);
    });
    */

    app.put('/api/lock/:id(*)', lock);
    app.put('/api/lock', lock);
    app.put('/api/unlock/:id(*)', unlock);
    app.put('/api/unlock', unlock);
    app.post('/api/version/:id', version);
}


