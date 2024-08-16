/*
 * ulid.js
 *
 * Generate identifiers using ulid
 * https://github.com/ulid/spec
 *
 * _id keys using ulid at create and upsert
 * By default the replaced pattern by a ulid is `{#}`
 *
 * depends on :
 * https://www.npmjs.com/package/ulid
 *
 */
 
module.exports = function (app) {
    var events = require('../events');
    const ULID = require('ulid');
    const pattern = new RegExp(app.locals.conf.ulid.replacedPattern || '{#}');
    events.attach('pre-create', function (nodes) {
        for(var i=0; i<nodes.length; i++){
            if(typeof nodes[i]._id === 'string'){
                nodes[i]._id = nodes[i]._id.replace(pattern, ULID.ulid());
            }
        }
        this.next();
    });
}


