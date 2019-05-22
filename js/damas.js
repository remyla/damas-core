(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory.bind(factory, root.XMLHttpRequest));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('xmlhttprequest').XMLHttpRequest);
    } else {
        // Browser globals
        root.damas = factory(root.XMLHttpRequest);
    }
}(this, function (XHR) {

    /**
     * DAMAS HTTP client module for Javascript.
     * @exports damas
     * @author The damas-core team
     * @copyright 2005-2015 Remy Lalanne
     * @license
     * This file is part of damas-core.
     *
     * damas-core is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * damas-core is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with damas-core.  If not, see http://www.gnu.org/licenses/.
     *
     * @example
     * // set the server URL
     * damas.server = "https://localhost:8443/api";
     *
     * // retrieve the node unique index of a file using its path in the project
     * var res = damas.search({"file":"/project/dir/file.png"});
     *
     * // retrieve the node using its index
     * damas.read(res[0])
     *
     * @property {string} server - damas server URL
     * @property {string} token - json web token for authentication
     * @property {string} user - authenticated user
     *
     */
    var damas = {};
    damas.server = '';
    damas.token = null;
    damas.user = null;

    /**
     * Send a request according to the given arguments
     * @param {object} args - All the given arguments
     * @return {} - The result of the request
     */
    req = damas.req = function (args) {
        if (undefined === args.async) {
            args.async = ('function' === typeof args.callback);
        }
        var xhr = new XHR();
        function checkXHR() {
            if (xhr.status < 300) {
                return JSON.parse(xhr.responseText);
            } else {
                console.warn(xhr.responseText);
                var myEvent = new CustomEvent("damasapi:error", {
                    detail: {
                        error: xhr.status,
                        text: xhr.responseText
                    }
                });
                window.dispatchEvent(myEvent);
                return null;
            }
        }
        xhr.onreadystatechange = function(e) {
            if (4 === xhr.readyState) {
                if (args.async && 'function' === typeof args.callback) {
                    args.callback(checkXHR());
                }
            }
        }
        xhr.open(args.method, damas.server + args.url, args.async);
        if(damas.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + damas.token);
        }
        if (undefined !== args.data) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(args.data));
        } else if (undefined !== args.form) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(args.form);
        } else {
            xhr.send();
        }
        if (!args.async) {
            return checkXHR();
        }
    }


    //
    //
    //
    // CRUD METHODS
    //
    //
    //

    /**
     * This callback type `requestCallback` to handle asynchronous requests results
     *
     * @callback requestCallback
     * @param {object} req - XHR object
     *
     */

    /**
     * Creates a node with the specified keys, asynchronously if a callback function is specified or synchronously otherwise.
     * @param {hash} keys - Hash of key:value pairs
     * @param {function} [callback] - Function with the XHR object as argument to call
     * @returns {object|boolean|undefined} New node on success, null otherwise (or nothing if async)
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test',type:'char'};
     *
     * //Create a new node using this set of keys
     * var newNode= damas.create(keys);
     */
    damas.create = function (nodes, callback) {
        return req({
            method: 'POST',
            url: 'create/',
            data: nodes,
            callback: callback
        });
    }

    /**
     * Retrieve one or many nodes specifying index(es)
     * @param {string|string[]} id - internal node index(es) to read. accepts arrays or comma separated indexes to read multiple nodes
     * @param {function} callback optional callback function to call for asynchrone mode. if undefined, fall back to synchrone mode.
     * @returns {object|object[]|undefined} Node or array of nodes
     *
     * @example
     * var ids=[id1,id2];
     *
     * //Get one node
     * var node= damas.read(id1);
     *
     * //Get a group of nodes
     * var nodes= damas.read(ids);
     */
    damas.read = function (id, callback) {
        if (Array.isArray(id) && id.length === 0) {
            return callback([]);
        }
        return req({
            method: 'POST',
            url: 'read/',
            data: id,
            callback: callback
        });
    }

    /**
     * Update the keys of one or several node(s). The specified keys overwrite existing keys,
     * others are left untouched. A null key value removes the key.
     * @param {object|array} node - Node or array of nodes
     * @returns {object|undefined} Node or nothing in case of asynchronous call
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test2',newKey:'name'};
     *
     * //Update the node id with this set of keys
     * var node= damas.update(id, keys);
     */
    damas.update = function (node, callback) {
        return req({
            method: 'PUT',
            url: 'update/',
            data: node,
            callback: callback
        });
    }

    /**
     * Create new node(s) or updates already existing node(s) if id is specified
     * and found.
     * @param {object|array} node - Node or array of nodes
     * @returns {object|array|undefined} Node or array of nodes, nothing if 
     * asynchronous call
     */
    damas.upsert = function (nodes, callback) {
        return req({
            method: 'POST',
            url: 'upsert/',
            data: nodes,
            callback: callback
        });
    }

    /**
     * Delete the specified node
     * @param {string} id - Node internal index to delete
     * @param {function} callback - Function to call, boolean argument
     * @returns {boolean} true on success, null otherwise
     *
     * @example
     * damas.delete(id);
     */
    damas.delete = function (id, callback) {
        return req({
            method: 'DELETE',
            url: 'delete/',
            data: id,
            callback: callback
        });
    }

    /**
     * Find elements wearing the specified key(s)
     * @param {String} search query string
     * @returns {Array} array of element indexes or null if no element found
     *
     * @example
     * var matches = damas.search('rabbit type:char');
     */
    damas.search = function (query, callback) {
        return req({
            method: 'GET',
            url: 'search/' + encodeURIComponent(query),
            callback: callback
        });
    }

    damas.search_one = function (query, callback) {
        return req({
            method: 'GET',
            url: 'search_one/' + encodeURIComponent(query),
            callback: callback
        });
    }

    /**
     * BETA - Expose the find method from mongodb
     * @param {Object} query
     * @param {Object} sort
     * @param {Integer} limit
     * @param {Integer} skip
     * @returns {Array} array of element indexes or null if no element found
     *
     * query, sort, limit, skip arguments are respectively passed to mongodb
     * methods of the same names.
     * https://docs.mongodb.org/manual/reference/method/db.collection.find/
     * because the query object is converted to JSON, we use strings with "REGEX_" as suffix to define regular expressions. for example, /.*x$/ will be defined as "REGEX_.*x$" 
     *
     * @example
     * damas.search_mongo({"lock": /.*$/}, {"lock":1}, 2,0)
     */
    damas.search_mongo = function (query, sort, limit, skip, callback) {
        var obj = {
            query: query,
            sort: sort,
            limit: limit,
            skip: skip
        }
        return req({
            method: 'POST',
            url: 'search_mongo',
            data: obj,
            callback: callback
        });
    }


/* this is the php version as reference
    damas.search = function (keys, sortby, order, limit, callback) {
        function req_callback(req) {
            return JSON.parse(req.transport.responseText);
        }
        var req = new Ajax.Request(this.server + "/model.json.php", {
            asynchronous: callback !== undefined,
            parameters: { cmd: 'search', keys: Object.toJSON(keys), sortby: sortby || 'label', order: order || 'ASC', limit: limit },
            onSuccess: function(req) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        });
        if (callback === undefined) {
            return req_callback(req);
        }
    }
*/

    /**
     * Recursively get all links and nodes sourced by the specified node
     * @param {String} id - Node index
     * @param {function} callback - Function to call, array argument
     * @returns {Array} array of element indexes or undefined if async
     *
     * @example
     * // this will return an array containing nodes (links are nodes too)
     * var sources = damas.graph("55687e68e040af7047ee1a53");
     */
    damas.graph = function (ids, callback) {
        return req({
            method: 'POST',
            url: 'graph/0/',
            data: ids,
            callback: callback
        });
    }

    // FIXME legacy?
    damas.get_rest = function (query, callback) {
        return req({
            method: 'GET',
            url: query,
            callback: callback
        });
    }

    damas.lock = function (id, callback) {
        var res = req({
            method: 'PUT',
            url: 'lock/',
            data: id,
            async: callback !== undefined,
            callback: function (res) {
                if ('function' === typeof callback) {
                    callback(res !== null);
                }
            }
        });
        return res !== null;
    }

    damas.unlock = function (id, callback) {
        var res = req({
            method: 'PUT',
            url: 'unlock/',
            data: id,
            async: callback !== undefined,
            callback: function (res) {
                if ('function' === typeof callback) {
                    callback(res !== null);
                }
            }
        });
        return res !== null;
    }

    damas.publish = function (nodes, callback) {
        return req({
            method: 'POST',
            url: 'publish/',
            data: nodes,
            callback: callback
        });
    }
    /**
     * Creates a new node under an existing node, asynchronously if a callback
     * function is specified or synchronously otherwise.
     * @param {hash} keys - Hash of key:value pairs
     * @param {function} [callback] - Function with the XHR object as an
     *                                argument to call.
     * @returns {object|boolean|undefined} New node on success, null otherwise
     * (or nothing if async)
     */
    damas.comment = function (node, callback) {
        return req({
            method: 'POST',
            url: 'comment/',
            data: node,
            callback: callback
        });
    }

    /**
     * Creates a node with the specified keys, asynchronously if a callback
     * function is specified or synchronously otherwise.
     * @param {hash} keys - Hash of key:value pairs
     * @param {function} [callback] - Function with the XHR object as argument to call
     * @returns {object|boolean|undefined} New node on success, null otherwise (or nothing if async)
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test',type:'char'};
     *
     * //Create a new node using this set of keys
     * var newNode= damas.create(keys);
     */
    damas.version = function (id, keys, callback) {
        return req({
            method: 'POST',
            url: 'version/' + id,
            data: keys,
            callback: callback
        });
    }

    //
    //
    //
    // USER AUTHENTICATION METHODS
    //
    //
    //

    /**
     * Sign in using the server embeded authentication system
     * @param {String} username the user id
     * @param {String} password the user secret password
     * @return true on success, false otherwise
     */
    damas.signIn = function (username, password, expiresIn, callback) {
        function req_callback(result) {
            if (result !== null) {
                damas.user = result;
                damas.token = damas.user.token;
            }
            return result;
        }
        let form = 'username='  + encodeURIComponent(username) +
                   '&password=' + encodeURIComponent(password);
        if (undefined != expiresIn && 'function' != typeof expiresIn) {
            form += '&expiresIn=' + encodeURIComponent(expiresIn);
        } else {
            callback = expiresIn;
        }
        var res = req({
            method: 'POST',
            url: 'signIn',
            form: form,
            async: callback !== undefined,
            callback: function (result) {
                if ('function' === typeof callback) {
                    callback(req_callback(result));
                }
            }
        });
        if (undefined !== res) {
            return req_callback(res);
        }
    }

    /**
     * Sign out using the server embeded authentication system
     */
    damas.signOut = function (callback) {
        damas.token = null;
        damas.user = null;
        if (callback) {
            callback();
        }
    }

    /**
     * Check if the authentication is valid
     * @return true on success, false otherwise
     */
    damas.verify = function (callback) {
        var res = req({
            method: 'GET',
            url: 'verify',
            async: callback !== undefined,
            callback: function (res) {
                if ('function' === typeof callback) {
                    callback(res !== null);
                }
            }
        });
        return res !== null;
    }


    damas.create_rest = damas.create;
    damas.read_rest = damas.read;
    damas.update_rest = damas.update;
    damas.delete_rest = damas.delete;
    damas.search_rest = damas.search;
    damas.graph_rest = damas.graph;

    return damas;

}));
