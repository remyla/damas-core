(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            return (root.returnExportsGlobal = factory());
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals
        root.damas = factory();
    }
}(this, function () {

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

    //
    //
    //
    //
    // CRUD METHODS
    //
    //
    //
    //

    /**
     * This callback type `requestCallback` to handle asynchronous requests results
     *
     * @callback requestCallback
     * @param {object} req - XMLHttpRequest object
     *
     */

    /**
     * Creates a node with the specified keys, asynchronously if a callback function is specified or synchronously otherwise.
     * @param {hash} keys - Hash of key:value pairs
     * @param {function} [callback] - Function with the XHR object as argument to call
     * @returns {object|boolean|undefined} New node on success, false otherwise (or nothing if async)
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test',type:'char'};
     *
     * //Create a new node using this set of keys
     * var newNode= damas.create(keys);
     */
    damas.create = function (keys, callback) {
        function req_callback(req) {
            if (201 === req.status || 207 === req.status) {
                return JSON.parse(req.responseText);
            }
            return false;
        }
        var req = new XMLHttpRequest();
        req.open('POST', this.server + "create/", callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        //req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send(JSON.stringify(keys));
        /*
        var qs = Object.keys(keys).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(keys[key]);
        }).join('&');
        req.send(qs);
        */
        if (callback === undefined) {
            return req_callback(req);
        }
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
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('POST', this.server + "read/", callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        req.setRequestHeader("Authorization","Bearer " + damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send(JSON.stringify(id));
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    /**
     * Update the keys of a node. The specified keys overwrite existing keys, others are left untouched. A null key value removes the key.
     * @param {string} id - Internal index of the node to update
     * @param {object} keys - Hash of key:value pairs
     * @returns {object|undefined} Node or nothing in case of asynchronous call
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test2',newKey:'name'};
     *
     * //Update the node id with this set of keys
     * var node= damas.update(id, keys);
     */
    damas.update = function (id, keys, callback) {
        if (Array.isArray(id)) {
            id = id.join(',');
        }
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('PUT', this.server + "update/" + id, callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        req.setRequestHeader("Accept","application/json");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState === 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send(JSON.stringify(keys));
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    /**
     * Delete the specified node
     * @param {string} id - Node internal index to delete
     * @param {function} callback - Function to call, boolean argument
     * @returns {boolean} true on success, false otherwise
     *
     * @example
     * damas.delete(id);
     */
    damas.delete = function (id, callback) {
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('DELETE', this.server + "delete/" + id, callback !== undefined);
        //req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
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
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('GET', this.server + 'search/' + encodeURIComponent(query), callback !== undefined);
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (callback) {
                        callback(req_callback(req));
                    }
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    damas.search_one = function (query, callback) {
         function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('GET', this.server + 'search_one/' + encodeURIComponent(query), callback !== undefined);
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (callback) {
                        callback(req_callback(req));
                    }
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
   }

    /**
     * BETA - Expose the find method from mongodb
     * @param {Object} query
     * @param {Object} sort
     * @param {Integer} limit
     * @param {Integer} skip
     * @returns {Array} array of element indexes or null if no element found
     *
     * query, sort, limit, skip arguments are respectively passed to mongodb methods of the same names.
     * https://docs.mongodb.org/manual/reference/method/db.collection.find/
     * because the query object is converted to JSON, we use strings with "REGEX_" as suffix to define regular expressions. for example, /.*x$/ will be defined as "REGEX_.*x$" 
     *
     * @example
     * damas.search_mongo({"lock": /.*$/}, {"lock":1}, 2,0)
     */
    damas.search_mongo = function (query, sort, limit, skip, callback) {
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('POST', this.server+"search_mongo", callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (callback) {
                        callback(req_callback(req));
                    }
                }
            }
        }
        var obj = {};
        obj.query = query;
        obj.sort = sort;
        obj.limit = limit;
        obj.skip = skip;
        req.send(JSON.stringify(obj));
        if (callback === undefined) {
            return req_callback(req);
        }
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
        function req_callback(req) {
            return JSON.parse(req.responseText);
        }
        var req = new XMLHttpRequest();
        req.open('GET', this.server + 'graph/' + encodeURIComponent(ids), callback !== undefined);
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (callback) {
                        callback(req_callback(req));
                    }
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    damas.get_rest = function (query, callback) {
        var req = new XMLHttpRequest();
        req.open('GET', this.server + query, callback !== undefined);
        //req.open('GET', this.server + encodeURIComponent(query), callback !== undefined);
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    callback(JSON.parse(req.responseText));
                }
            }
        }
        req.send();
    }

    damas.lock = function (id, callback) {
        function req_callback(req) {
            return req.status === 200;
        }
        var req = new XMLHttpRequest();
        req.open('PUT', this.server+'lock/'+id, callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        req.setRequestHeader("Accept","application/json");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState === 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    damas.unlock = function (id, callback) {
        function req_callback(req) {
            return req.status === 200;
        }
        var req = new XMLHttpRequest();
        req.open('PUT', this.server+'unlock/'+id, callback !== undefined);
        req.setRequestHeader("Content-type","application/json");
        req.setRequestHeader("Accept","application/json");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState === 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send();
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    /**
     * Creates a node with the specified keys, asynchronously if a callback function is specified or synchronously otherwise.
     * @param {hash} keys - Hash of key:value pairs
     * @param {function} [callback] - Function with the XHR object as argument to call
     * @returns {object|boolean|undefined} New node on success, false otherwise (or nothing if async)
     *
     * @example
     * //Create a set of keys for our node
     * var keys= {name:'test',type:'char'};
     *
     * //Create a new node using this set of keys
     * var newNode= damas.create(keys);
     */
    damas.version = function (id, keys, callback) {
        function req_callback(req) {
            if (req.status === 201) {
                return JSON.parse(req.responseText);
            }
            return false;
        }
        var req = new XMLHttpRequest();
        req.open('POST', this.server+'version/'+id, callback !== undefined);
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        var qs = Object.keys(keys).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(keys[key]);
        }).join('&');
        req.send(qs);
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    //
    //
    //
    //
    // USER AUTHENTICATION METHODS
    //
    //
    //
    //

    /**
     * Sign in using the server embeded authentication system
     * @param {String} username the user id
     * @param {String} password the user secret password
     * @return true on success, false otherwise
     */
    damas.signIn = function (username, password, callback) {
        function req_callback(req) {
            if (req.status === 200) {
                damas.user = JSON.parse(req.responseText);
                damas.token = damas.user.token;
                return JSON.parse(req.responseText);
            }
            return false;
        }
        var req = new XMLHttpRequest();
        req.open('POST', this.server+"signIn", callback !== undefined);
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send("username="+encodeURIComponent(username) + "&password="+encodeURIComponent(password));
        if (callback === undefined) {
            return req_callback(req);
        }
    }

    /**
     * Sign out using the server embeded authentication system
     * @return true on success, false otherwise
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
        function req_callback(req) {
            if (req.status === 200) {
                return true;
            }
            return false;
        }
        var req = new XMLHttpRequest();
        req.open('GET', this.server+"verify", callback !== undefined);
        req.setRequestHeader("Authorization","Bearer "+damas.token);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                if (callback) {
                    callback(req_callback(req));
                }
            }
        }
        req.send();
    }


    damas.create_rest = damas.create;
    damas.read_rest = damas.read;
    damas.update_rest = damas.update;
    damas.delete_rest = damas.delete;
    damas.search_rest = damas.search;
    damas.graph_rest = damas.graph;

    return damas;

}));
