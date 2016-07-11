/*
 * Licensed under the GNU GPL v3
 */

var events = require('./');
var debug = require('debug')('app:propagation:' + process.pid);

function removeLinks(id) {
    this.next(); // Non-blocking; call the next listener
    var ids = [];
    db.search({tgt_id: id}, function (err, links) {
        ids = ids.concat(links);
        db.search({src_id: id}, function (err, links) {
            ids = ids.concat(links);
            db.remove(ids, function (err) {
                err && debug('Error while propagating "remove"');
            });
        });
    });
}

events.attach('remove', removeLinks);


