/*
 * graph.js
 */
module.exports = function(app, routes) {
    var self = this;
    var utils = require('../routes/utils');
    var events = require('../events');
    var db = app.locals.db;


    /**
     * Delete specified nodes and any other node that might be associated
     * @param {array} ids - List of node ids to delete
     * @param {function} callback - Callback function to graphDelete
     */
    self.graphRemove = function (ids, callback) {
        var relatedIds = [].concat(ids);
        db.getCollection(callback, function (coll) {
            coll.find({$or: [{tgt_id: {$in: ids}}, {src_id: {$in: ids}}]}).toArray(function (err, results) {
                if (err) {
                    callback(true);
                    return;
                }
                for (var r in results) {
                    relatedIds.push(results[r]._id);
                }
                if (relatedIds.length != 0) {
                    //fireEvent('graphRemove', relatedIds);
                    db.remove(relatedIds, callback);
                }
            });
        });
    };

    /*
     * graphDelete()
     *
     * Method: DELETE
     * URI: /api/
     *
     * Delete nodes recursively
     *
     * HTTP status codes:
     * - 200: OK (nodes deleted (or not found))
     * - 207: Multi-Status (some nodes do not exist)
     * - 400: Bad Request (not formatted correctly)
     * - 404: Not Found (all the nodes do not exist)
     * - 500: Internal Server Error (could not access the database)
     */
    var graphDelete = function (req, res) {
        var ids = getBodyIds(req);
        if (!ids) {
            return httpStatus(res, 400, 'Graph Remove');
        }
        events.fire('pre-graphRemove', ids).then(function (data) {
             if (data.status) {
                 return httpStatus(res, data.status, 'Graph Remove');
             }
             self.graphRemove(data.ids || ids, function (error, doc) {
                 if (error) {
                     return httpStatus(res, 500, 'Graph Remove');
                 }
                 var response = getMultipleResponse(doc);
                 if (response.fail) {
                     httpStatus(res, 404, 'Graph Remove');
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

    app.delete('/api/graphDelete', graphDelete);
    
    routes = Object.assign(routes, {
    graphDelete: graphDelete,
    });
}
