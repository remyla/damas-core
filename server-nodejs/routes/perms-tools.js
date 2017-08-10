/*
 * Licensed under the GNU GPL v3
 */
module.exports = function(app) {
    var db = app.locals.db;
    var module = {};
        module.extractIds = function(nodes) {
            var ids = [];
            nodes = unfoldIds(nodes);
            for(var i in nodes) {
                ids.push(nodes[i]._id);
            }
            return ids;
        };

        module.filterByAuthor = function(ids, username, callback) {
            var perms = [];
            db.read(ids, function(err, nodes) {
                for(var i in nodes) {
                    if(nodes[i] === null) {
                        perms.push(true);
                        continue;
                    }
                    if(nodes[i].author !== username) {
                        perms.push(false);
                        continue;
                    }
                    perms.push(true);
                }
                callback(perms);
            });
        };

        module.filterRequest = function(table, perms) {
            for(var i in table) {
                if(perms[i] === false) {
                    table.splice(i, 1, 'null');
                }
            }
            return table;
        };

        module.isOperationAllowed = function(operationName, userClass) {
            switch (operationName) {
            case 'create':
            case 'lock':
            case 'unlock':
            case 'publish':
            case 'upload':
            case 'version':
            case 'file':
            case 'comment':
                // User class must be at least 'user'
                if (['user', 'editor', 'admin'].indexOf(userClass) === -1) {
                    return false;
                }
                break;
            case 'update':
            case 'upsert':
            case 'delete':
                // User class must be at least 'editor'
                if (['editor', 'admin'].indexOf(userClass) === -1) {
                    return false;
                }
                break;
            }
            return true;
        };
        return module;
};


