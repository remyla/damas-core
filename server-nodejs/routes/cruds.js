module.exports = function(app, express) {
    var db  = app.locals.db;
    //methodOverride = require('method-override' ),
    var fs  = require('fs');
    var multer  = require('multer');

/*
    app.use(methodOverride(function(req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body ) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    //Handle errors
    app.use(function(err, req, res, next) {
        if (err ) {
            console.log("An error has occurred: "+ err);
        }
        else {
            next();
        }
    });
*/

    /* CRUD operations */
    create = function(req, res ) {
        if (Object.keys(req.body).length === 0) {
            res.status(400).send('create error: the body of the request is empty');
            return;
        }
        var keys = req.body;
        keys.author = req.user.username || req.connection.remoteAddress;
        keys.time = Date.now();
        db.createNodes(keys, function(error, doc) {
            if (error) {
                res.status(409).send('create error, please change your values');
                return;
            }
            res.status(201).send(doc);
        });
    };

    read = function(req,res ) {
        var id = req.params.id || req.body.id;
        if (!id) {
            res.status(400).send('read error: the specified id is not valid');
            return;
        }
        db.readNodes(id.split(","), function(error, doc) {
            if (error) {
                res.status(409).send('read error, please change your values');
                return;
            }
            if (doc.length===0) {
                res.status(404).send('Id not found');
                return;
            }
            res.status(200).send(doc);
        });
    };

    update = function(req, res ) {
/*
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).send('update error: the specified id is not valid');
            return;
        }
        if (Object.keys(req.body).length === 0) {
            res.status(400).send('update error: the body of the request is empty');
            return;
        }
*/
        db.updateNodes(req.params.id.split(","), req.body, function(error, doc) {
            if (error) {
                res.status(409).send('update error, please change your values');
                return;
            }
            res.status(200).json(doc);
        });
    };

    deleteNode = function(req, res) {
        /* this check should not be based on ObjectId - disabled
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).send('error: the specified id is not valid');
            return;
        }
        */
        db.removeNodes(req.params.id, function(error, doc) {
            if (error) {
                res.status(409).send('delete error, please change your values');
                return;
            }
            res.status(200).send(doc.result.n + " documents deleted.");
        });
    };

    graph = function(req,res) {
        var id = req.params.id || req.body.id;
        if (!id || id=="undefined") {
            res.status(400).send('Bad command');
            return;
        }
        //obsolete
        db.getGraph(id.split(","), function(error, nodes) {
            if (error) {
                res.status(409).send('graph error, please change your values');
                return;
            }
            if (nodes) {
                res.status(200).json(nodes);
            }
            else
                res.status(404).send('Id not found');
        });
    };

    search = function(req, res) {
        var q = req.params.query || req.body.query;
        if (!q || q=="undefined") {
            res.status(400);
            res.send('Bad command');
            return;
        }
        q = q.replace(/\s+/g,' ').trim();
        //q = q.replace('< ','<');
        //q = q.replace('<= ','<=');
        //q = q.replace('>= ','>=');
        //q = q.replace('> ','>');
        //q = q.replace(': ',':');
        var terms = q.split(" ");
        var pair;
        var result={};
        //var j;
        //var tempField;
        for(var i=0; i< terms.length; i++) {
            if (terms[i].indexOf('<=') > 0) {
                pair = terms[i].split('<=');
                result[pair[0]] = { $lte: decodeURIComponent(pair[1]) };
                continue;
            }
            if (terms[i].indexOf('<') > 0) {
                pair = terms[i].split('<');
                result[pair[0]] = { $lt: decodeURIComponent(pair[1]) };
                continue;
            }
            if (terms[i].indexOf('>=') > 0) {
                pair = terms[i].split('>=');
                result[pair[0]] = { $gte: decodeURIComponent(pair[1]) };
                continue;
            }
            if (terms[i].indexOf('>') > 0) {
                pair = terms[i].split('>');
                result[pair[0]] = { $gt: decodeURIComponent(pair[1]) };
                continue;
            }
            if (terms[i].indexOf(':') > 0) {
                pair = terms[i].split(':');
                var value = decodeURIComponent(pair[1]);

                var flags = value.replace(/.*\/([gimy]*)$/, '$1');
                var pattern = value.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
                if (flags!=value && pattern!=value) {
                    var regex = new RegExp(pattern, flags);
                    result[pair[0]] = regex;
                }
                else {
                    result[pair[0]] = value;
                }
/*
                for(j=1;j<pair.length-1;j++)
                    result[tempField]+=decodeURIComponent(pair[j])+":";
                if (pair[j]!='')
                    result[tempField]+=decodeURIComponent(pair[j]);
*/
                continue;
            }
/* implement full text search
            result['$where'] = function() {
                for (var key in this) {
                    if (this[key] )
                }
            }
db.things.find({$where: function() {
  for (var key in this) {
    if (this[key] === "bar") {
      return true;
    }
    return false;
    }
}});
*/
/*
            if (i==0) {
                continue;
            }
            if (result[tempField]!='')
                result[tempField]+= " "+terms[i];
            else
                result[tempField]+=terms[i];
*/
        }
        db.searchNodes(result, function(error, doc) {
            if (error) {
                res.status(409).send('Read Error, please change your values');
                return;
            }
            res.status(200).send(doc);
        });
    }

    search_mongo = function(req, res) {
        if(typeof db.mongo_searchNodes !== "function") {
            res.status(409).send('MongoDB not in use');
            return;
        }
        var query, sort, limit, skip;
        if (req.body.queryobj) {
            var data = JSON.parse(req.body.queryobj);
            query =  data.query;
            sort =  data.sort;
            limit =  data.limit | 0;
            skip =  data.skip | 0;
        }
        else {
            query = req.body.query;
            sort = req.body.sort;
            limit = req.body.limit | 0;
            skip = req.body.skip | 0;
        }
        function mongoops (obj) {
            for (var key in obj) {
                if (!key) continue;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // recursive
                    mongoops(obj[key]);
                }
                if (typeof obj[key] === "string") {
                    // replace regexps from json
                    if (obj[key].indexOf('REGEX_') === 0 ) {
                        obj[key] = new RegExp(obj[key].replace('REGEX_',''));
                    }
                }
            }
        }
        mongoops(query);
        //this is done in every dbms object
        /*db.connection(function(err, database ) {
            if (err) {
                res.status(409).send('mongodb connection error');
            }
            else {
                database.collection("node", function(err, collection) {
                    if (err) {
                        console.log(err);
                        res.status(409).send('mongodb collection retrival error');
                    }
                    else {*/
                        db.mongo_searchNodes(query, sort, skip, limit).toArray(function(err, results) {
                            if (err)
                                res.status(409).send('mongodb find error');
                            else {
                                var ids=[];
                                for(r in results)
                                    ids.push((results[r]._id).toString());
                                res.status(200).json(ids);
                            }
                        });
                    /*}
                });
            }
        });*/
    }

    /**
     * Import a JSON graph commit from our current Php Server
     *
     */
    importJSON = function(req, res ) {
        var json = JSON.parse(req.body.text);
        json.nodes.forEach(function(node, i, nodes) {
            var keys = node.keys;
            keys.mysqlid = node.id;
            db.searchNodes({mysqlid:keys.mysqlid}, function(err, res) {
                if (err) {
                    console.log('ERROR');
                    return;
                }
                if (res.length === 0) {
                    db.createNodes(keys, function(err, n) {
                        if (err) console.log('ERROR create')
                    });
                }
                else {
                    console.log('found mysqlid:'+keys.mysqlid);
                }
                if (i===nodes.length -1) {  // we finished inserting nodes
                    json.links.forEach(function(link) {
                        console.log(link );
                        db.searchNodes({mysqlid:link.src_id.toString()}, function(err, res1) {
                            if (!err) {
                                db.searchNodes({mysqlid:link.tgt_id.toString()}, function(err, res2) {
                                    if (!err) {
                                        db.createNodes({src_id: res1[0], tgt_id: res2[0]}, function() {});
                                    }
                                    else {
                                        console.log('LINK ERR');
                                    }
                                });
                            }
                            else {
                                console.log('LINK ERR');
                            }
                        });
                    });

                }
            })
        }, json);
        res.status(200);
        res.send();
    };

    getFile= function(req,res) {
        var path = fileSystem+decodeURIComponent(req.params.path).replace(/:/g,"").replace(/\/+/g,"/");
        fs.exists(path, function(exists) {
            if (exists) {
                var stream = fs.createReadStream(path, { bufferSize: 64 * 1024 });
                res.writeHead(200);
                stream.pipe(res);
            }
            else {
                res.status(404);
                res.send('File not found');
            }
        });
    };

    //
    // Extra operations
    //
    app.get('/api/graph/:id', graph);
    app.get('/api/file/:path(*)',getFile);
    app.post('/api/import', importJSON);
    //app.get('/subdirs/:path',getSubdirs);
    //app.get('/subdirs',getSubdirs);

    //
    // Alternative Operations ()
    //
    app.get('/api/search/:query(*)', search);
    app.post('/api/search_mongo', search_mongo);
    app.get('/api/graph/', graph);
    app.get('/api/', read);
    //app.put('/', update);
    //app.delete('/', deleteNode);

    //
    // CRUDS operations
    //
    app.post('/api/', create);
    app.get('/api/:id', read);
    app.put('/api/:id', update);
    app.delete('/api/:id', deleteNode);
}
