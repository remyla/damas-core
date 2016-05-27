/*
 * dam.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

module.exports = function (app) {
    var db = app.locals.db;
    var sep = '<sep>';

    function getRequestIds(req, isArrayCallback) {
        if (req.params.id) {
            var ids = req.params.id.split(sep);
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
     * Method: PUT
     * URI: /api/lock/
     *
     * Attempt to lock an asset
     *
     * HTTP status codes:
     * - 200: OK (asset locked correctly by the current user)
     * - 400: Bad request (not formatted correctly)
     * - 403: Forbidden (the user does not have the right permissions)
     * - 404: Not Found (the asset does not exist)
     * - 409: Conflict (asset already locked by someone else)
     */
    app.put('/api/lock/:id', function (req, res) {
        /* this check should not be based on mongo ObjectId, we disable it
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400);
            res.send('lock error: the specified id is not valid');
            return;
        }
        */
        var n = db.read(getRequestIds(req), function (err, n) {
            if (n[0].lock !== undefined) {
                res.status(409);
                res.send('lock error, the asset is already locked');
                return;
            }
            var keys = {
                "lock": req.user.username || req.connection.remoteAddress
            };
            db.update(getRequestIds(req), keys, function (error, doc) {
                if (error) {
                    res.status(409);
                    res.send('lock error, please change your values');
                    return;
                }
                res.status(200);
                res.json(doc[0]);
            });
        });
    });


    /*
     * Method: PUT
     * URI: /api/unlock/
     *
     * Attempt to unlock an asset
     *
     * HTTP status codes:
     * - 200: OK (asset unlocked correctly)
     * - 400: Bad request (not formatted correctly)
     * - 404: Not Found (the asset does not exist)
     * - 409: Conflict (asset locked by someone else)
     */
    app.put('/api/unlock/:id', function (req, res) {
        /*
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400);
            res.send('lock error: the specified id is not valid');
            return;
        }
        */
        var n = db.read(getRequestIds(req), function (err, n) {
            var user = req.user.username || req.connection.remoteAddress;
            if (n[0].lock !== user) {
                res.status(409);
                res.send('lock error, the asset is locked by '+ n[0].lock);
                return;
            }
            db.update(getRequestIds(req), {"lock": null}, function (error, doc) {
                if (error) {
                    res.status(409);
                    res.send('lock error, please change your values');
                    return;
                }
                res.status(200);
                res.send(doc[0]);
            });
        });
    });


    /*
     * Method: POST
     * URI: /api/version/
     *
     * Create a new version of the specified node (as a child node)
     *
     * HTTP status codes:
     * - 200: OK (version created correctly)
     * - 400: Bad request (not formatted correctly)
     * ? 403: Forbidden (the user does not have the right permissions)
     * - 404: Not Found (the parent node (or the file?) does not exist)
     * ? 409: Conflict (asset locked by someone else)
     */
    app.post('/api/version/:id', function (req, res) {
        var keys = req.body;
        if (!keys.file) {
            res.status(400);
            res.send('version error: file key must be specified');
            return;
        }
        keys.author = req.user.username || req.connection.remoteAddress;
        keys.time = Date.now();
        keys['#parent'] = req.params.id;
        db.create(keys, function (error, doc) {
            if (error) {
                res.status(409);
                res.send('create error, please change your values');
                return;
            }
            res.status(201);
            res.send(doc[0]);
        });
    });

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
     * ? 403: Forbidden (the user does not have the right permissions)
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
}


