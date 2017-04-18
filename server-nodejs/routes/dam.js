/*
 * dam.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app, routes) {
    var db = app.locals.db;
    require('./utils');

    var publish = function (req, res) {
        var nodes = Array.isArray(req.body) ? req.body : [req.body];
        nodes = unfoldIds(nodes);
        for (var i = 0; i < nodes.length; ++i) {
            if (undefined === nodes[i]._id || undefined === nodes[i].comment || undefined === nodes[i].origin) {
                return httpStatus(res, 400, 'Publish');
            }
            if (nodes[i]._id[0] !== '/') {
                return httpStatus(res, 400, 'Publish');
            }
        }
        routes.create(req, res);
    };

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
    var lock = function (req, res) {
        var ids = getBodyIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Lock');
        }

        var n = db.read(ids, function (err, nodes) {
            if (err) {
                return httpStatus(res, 409, 'Lock');
            }
            var user = req.user.username;
            for (var i = 0; i < nodes.length; ++i) {
                if (null === nodes[i]) {
                    continue;
                }
                if (undefined !== nodes[i].lock && user !== nodes[i].lock) {
                    return httpStatus(res, 409, 'Lock');
                }
            }
            req.body = {_id: ids, lock: user};
            routes.update(req, res);
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
    var unlock = function (req, res) {
        var ids = getBodyIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Unlock');
        }

        var n = db.read(ids, function (err, nodes) {
            if (err) {
                return httpStatus(res, 409, 'Unlock');
            }
            var user = req.user.username;
            for (var i = 0; i < nodes.length; ++i) {
                if (null === nodes[i]) {
                    continue;
                }
                if (undefined !== nodes[i].lock && user !== nodes[i].lock) {
                    return httpStatus(res, 409, 'Unlock');
                }
            }
            req.body = {_id: ids, lock: null};
            routes.update(req, res);
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
    var version = function (req, res) {
        var upload = req.upload ? req.upload : {};
        if (!req.body.file || !req.params.id) {
            return httpStatus(res, 400, 'Version');
        }
        var head = {
            _id:  upload.id   || req.params.id,
            time: upload.time || Date.now(),
            file: upload.file || req.body.file,
            author: req.user.username
        };
        db.read([head._id], function (err, previous) {
            if (err || null === previous[0]) {
                return httpStatus(res, 404, 'Version');
            }
            var file = previous[0].file || head.file;
            var child = Object.assign(previous[0], {
                '#parent': head._id,
                file: formatVersion(file, previous[0].time)
            });
            delete child._id;
            delete child.version;

            db.create([child], function (err, result) {
                if (err) {
                    return httpStatus(res, 409, 'Version');
                }
                for (var key in child) {
                    child[key] = null;
                }
                db.search({'#parent': head._id}, function (err, doc) {
                    head = Object.assign(child, req.body, head);
                    head.version = 1 + (err ? 0 : doc.length);
                    db.update([head], function (err, doc) {
                        if (err || null === doc[0]) {
                            return httpStatus(res, 409, 'Version');
                        }
                        httpStatus(res, 201, doc[0]);
                    });
                });
            });
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
        keys.author = req.user.username;
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

    app.put('/api/lock/', lock);
    app.post('/api/publish/', publish);
    app.put('/api/unlock/', unlock);
    app.post('/api/version/:id(*)', version);

    routes = Object.assign(routes, {
        lock: lock,
        publish: publish,
        unlock: unlock,
        version: version
    });
}


