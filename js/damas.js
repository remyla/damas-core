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
	 * damas.server = "https://server/";
	 *
	 * // retrieve the node unique index of a file using its path in the project
	 * var res = damas.search({"file":"/project/dir/file.png"});
	 *
	 * // retrieve the node using its index
	 * damas.read(res[0])
	 *
	 * @property {string} server - damas server URL
	 *
	 */
	var damas = {};
	damas.server = '';

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
	damas.create = function ( keys, callback )
	{
		function req_callback( req ) {
			if(req.status === 201)
			{
				return JSON.parse(req.responseText);
			}
			return false;
		}
		var req = new XMLHttpRequest();
		req.open('POST', this.server, callback !== undefined);
		req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(callback)
				{
					callback(req_callback(req));
				}
			}
		}
		var qs = Object.keys(keys).map(function(key){
			return encodeURIComponent(key) + '=' + encodeURIComponent(keys[key]);
		}).join('&');
		req.send(qs);
		if(callback === undefined)
		{
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
	damas.read = function ( id, callback )
	{
		var multi = false;
		if( Array.isArray(id) )
		{
			if( id.length === 0 )
			{
				return callback([]);
			}
			else
			{
				id = id.join(',');
				multi = true;
			}
		}
		if( typeof(id) === 'string' && id.indexOf(',') != -1 )
		{
			multi = true;
		}
		function req_callback( req ) {
			return JSON.parse(req.responseText);
		}
		var req = new XMLHttpRequest();
		req.open('GET', this.server + id, callback !== undefined);
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if( callback )
				{
					callback( req_callback( req ) );
				}
			}
		}
		req.send();
		if( callback === undefined )
		{
			return req_callback( req );
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
	damas.update = function ( id, keys, callback )
	{
		function req_callback( req ) {
			return JSON.parse( req.responseText );
		}
		var req = new XMLHttpRequest();
		req.open('PUT', this.server+id,callback !== undefined);
		req.setRequestHeader("Content-type","application/json");
		req.setRequestHeader("Accept","application/json");
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(callback)
				{
					callback(req_callback(req));
				}
			}
		}
		req.send(JSON.stringify(keys));
		if(callback === undefined)
		{
			return req_callback(req);
		}
	}

	/**
	 * Recursively delete the specified node
	 * @param {string} id - Node internal index to delete
	 * @param {function} callback - Function to call, boolean argument
	 * @returns {boolean} true on success, false otherwise
	 *
	 * @example
	 * damas.delete(id);
	 */
	damas.delete = function ( id, callback)
	{
		function req_callback( req ) {
			return req.status === 200;
		}
		var req = new XMLHttpRequest();
		req.open('DELETE', this.server + id, callback !== undefined);
		req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(callback)
				{
					callback(req_callback(req));
				}
			}
		}
		req.send();
		if(callback === undefined)
		{
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
	damas.search = function ( query, callback )
	{
		var req = new XMLHttpRequest();
		req.open('GET', this.server + 'search/' + encodeURIComponent(query), callback !== undefined);
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(req.status == 200)
				{
					//callback( { 'status': req.status, text: req.responseText } );
					callback(JSON.parse(req.responseText));
				}
			}
		}
		req.send();
	}

/* this is the php version as reference
	damas.search = function ( keys, sortby, order, limit, callback )
	{
		function req_callback( req ) {
			return JSON.parse( req.transport.responseText );
		}
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: callback !== undefined,
			parameters: { cmd: 'search', keys: Object.toJSON(keys), sortby: sortby || 'label', order: order || 'ASC', limit: limit },
			onSuccess: function( req ){
				if( callback )
				{
					callback( req_callback( req ) );
				}
			}
		});
		if( callback === undefined )
		{
			return req_callback( req );
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
	damas.graph = function ( ids, callback )
	{
		function req_callback( req ) {
			JSON.parse(req.responseText);
		}
		var req = new XMLHttpRequest();
		req.open('GET', this.server + 'graph/' + encodeURIComponent(ids), callback !== undefined);
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(req.status == 200)
				{
					if(callback)
					{
						callback(req_callback(req));
					}
				}
			}
		}
		req.send();
		if(callback === undefined)
		{
			return req_callback(req);
		}
	}

	damas.get_rest = function ( query, callback )
	{
		var req = new XMLHttpRequest();
		req.open('GET', this.server + query, callback !== undefined);
		//req.open('GET', this.server + encodeURIComponent(query), callback !== undefined);
		req.onreadystatechange = function(e){
			if(req.readyState == 4)
			{
				if(req.status == 200)
				{
					callback(JSON.parse(req.responseText));
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
