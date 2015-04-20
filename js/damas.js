/**
 * @fileoverview Javascript methods and objects for DAMAS software (damas-software.org)
 *
 * @author Remy Lalanne
 *
 * @copyright 2005-2015 Remy Lalanne
 *
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
 */

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
	 * Static library with methods for Digital Asset Management.
	 * Methods to interact with a remote DAMAS database.
	 *
	 * @example
	 * damas.server = "https://server/";
	 * damas.signIn("username", "password");
	 *
	 * @namespace
	 * @requires prototypejs.Ajax
	 * @property {String} server The currently connected DAMAS server URL
	 * @property {String} version The version of DAMAS which is running
	 * @property {String} username The name of the authenticated user
	 * @property {String} userclass The class of the authenticated user
	 * @property {String} user_id The damas element id of the authenticated user
	 *
	 */
	var damas = {};
	damas.server = '';
	damas.version = '2.2-beta6';
	damas.username = false;
	damas.userclass = false;
	damas.user_id = false;

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
	 * Get user if authenticated, or false otherwise
	 * @return {Hash} User hash on success, false otherwise
	 */
	damas.getUser = function ()
	{
		var req = new Ajax.Request( damas.server + "/authentication.php", {
			asynchronous: false,
			parameters: { cmd: "getUser" },
			onFailure: function(req){
				damas.username = false;
				damas.userclass = false;
				damas.user_id = false;
				//document.fire('auth:required');
			},
			onSuccess: function( req ){
				var resp = JSON.parse( req.transport.responseText );
				damas.username = resp.username;
				damas.userclass = resp.userclass;
				damas.user_id = resp.user_id;
				document.fire('auth:success');
			}
		});
	}

	/**
	 * Sign the user in, using the default user authentication system
	 * @param {String} username the user id
	 * @param {String} password the user secret password
	 * @return true on success, false otherwise
	 */
	damas.signIn = function ( username, password )
	{
		var ret = false;
		var req = new Ajax.Request( damas.server + "/authentication.php", {
			asynchronous: false,
			parameters: {
				"cmd": "login",
				"user": username,
				"password": password
			},
			onFailure: function(req){
				document.fire('auth:failure');
				ret = false;
			},
			onSuccess: function( req ){
				ret = true;
				document.fire('auth:success');
			}
		});
		return ret;
	}

	/**
	 * Sign the user out, using the default user authentication system
	 * @return true on success, false otherwise
	 */
	damas.signOut = function()
	{
		var ret = false;
		var req = new Ajax.Request( damas.server + "/authentication.php", {
			asynchronous: false,
			parameters: {
				"cmd": "logout"
			},
			onFailure: damas.onFailure,
			onSuccess: function( req ){
				ret = true;
				damas.username = false;
				damas.userclass = false;
				document.fire('auth:logout');
			}
		});
		return ret;
	}


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
	 * Creates a node of the specified type
	 * @param {String} type type of the new node
	 * @param {Hash} keys Hash of key/value pairs
	 * @returns {damas.element} New node on success, false otherwise
	 */
	damas.create = function ( keys, callback )
	{
		//return damas.utils.readJSONElement( JSON.parse( damas.utils.command( { cmd: 'create', type: type, keys: Object.toJSON(keys) } ).text ) );
		function req_callback( req ) {
			if(req.transport.status === 200)
			{
				return damas.utils.readJSONElement(JSON.parse(req.transport.responseText));
			}
			return false;
		}
		var req = new Ajax.Request( this.server + "/model.json.php", {
			method: "POST",
			asynchronous: callback !== undefined,
			parameters: {cmd: "create", keys: Object.toJSON(keys)},
			onComplete: function( req ){
				if(callback)
				{
					callback(req_callback(req));
				}
			}
		});
		if(callback === undefined)
		{
			return req_callback(req);
		}
	}

	/**
	 * Retrieve one or many nodes specifying index(es)
	 * @param {Integer} id internal node index(es) to read, comma separated
	 * @param {Function} callback optional callback function to call for asynchrone mode. if undefined, fall back to synchrone mode.
	 * @returns {damas.element} Damas element or false on failure
	 *
	 * @example
	 * damas.read([456, 7658, 3231], function(nodes){
	 *     console.log(nodes.each.print());
	 * });
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
			if( multi )
				return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) );
			else
				return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) )[0];
		}
		var req = new Ajax.Request( this.server + "/model.json.php", {
			method: "POST",
			asynchronous: callback !== undefined,
			parameters: { cmd: "read", id: id, depth: "1", flags: "4" },
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

	/**
	 * Update the keys of a node. The specified keys overwrite existing keys, others are left untouched. A null key value removes the key. 
	 * @param {Integer} id internal node index to update
	 * @returns {damas.element} Damas element or false on failure
	 */
	damas.update = function ( id, keys, callback )
	{
		function req_callback( req ) {
			return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ));
		}
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: callback !== undefined,
			parameters: {
				cmd: 'update',
				id: id,
				keys: Object.toJSON(keys) },
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
		//return damas.utils.readJSONElement( JSON.parse( damas.utils.command( { cmd: 'update', id: id, keys: Object.toJSON(keys) } ).text ) );
	}

	/**
	 * Recursively delete the specified node
	 * @param {Integer} id Element index to delete
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.delete = function ( id )
	{
		return damas.utils.command( { cmd: 'delete', id: id } ).status === 200;
	}

	/**
	 * Find elements wearing the specified key(s)
	 * @param {Hash} keys Hash of key/value pairs to match
	 * @returns {Array} array of element indexes or null if no element found
	 */
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

	/**
	 * OK
	 * Find elements, specifying an SQL SELECT query.
	 * The query must be formated to return results with an 'id' named column, which
	 * contains elements indexes.
	 * @param {String} query SQL query to perform
	 * @returns {Array} array of element indexes
	 */
	damas.findSQL = function ( query )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'findSQL', query: query }
		});
		return JSON.parse( req.transport.responseText );
	}

	/**
	 * Search for elements wearing the specified tag
	 * @param {String} tagname Tag to search
	 * @returns {Array} array of node indexes
	 */
	damas.findTag = function ( tagname )
	{
		return damas.findSQL( "SELECT tag.node_id AS id FROM tag LEFT JOIN `key` ON `key`.node_id=tag.node_id AND ( key.name='label' ) WHERE tag.name='" + tagname + "' ORDER BY `key`.value;" );
	}




	//
	//
	//
	//
	// ROOTED TREE METHODS
	//
	//
	//
	//

	/**
	 * Retrieve the ancestors (parent and above) of a node
	 * @param {Integer} id node index
	 * @return {Array} array of ancestors ids
	 */
	damas.ancestors = function ( id, callback )
	{
		function req_callback( req ) {
			return JSON.parse( req.transport.responseText );
		}
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: callback !== undefined,
			parameters: {
				cmd: 'ancestors',
				id: id },
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

	/**
	 * Retrieve the children of a node
	 * @param {Integer} id node index
	 * @return {Array} array of children elements
	 */
	damas.children = function ( id )
	{
		return damas.utils.readJSONElements( JSON.parse( damas.utils.command( { cmd: 'children', id: id } ).text ) );
	}

	/**
	 * @OBSOLETE
	 * @deprecated
	 * Move elements
	 * @param {Integer} id Element index
	 * @param {Integer} target Index of the new parent element
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.move = function ( id, target )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'move', id: id, target: target }
		});
		return req.transport.status == 200;
	}

	//
	//
	//
	//
	// OTHER METHODS
	//
	//
	//
	//


	/**
	 * Remove every elements from the trashcan.
	 * Privileged 'admin' users only.
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.empty_trashcan = function ( )
	{
		var req = new Ajax.Request( this.server + "/asset.json.php", {
			asynchronous: false,
			parameters: { cmd: 'empty_trashcan' }
		});
		if( req.transport.status == 200 )
		{
			document.fire( 'dam:element.updated', this.search( { 'id': 'dam:trash' } ) );
		}
		return req.transport.status == 200;
	}

	/**
	 * Make a link
	 * @param {Integer} src_id Source element index
	 * @param {Integer} tgt_id Target element index
	 * @returns {Integer} link index on success, false otherwise
	 */
	damas.link = function ( src_id, tgt_id )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'link', src: src_id, tgt: tgt_id }
		});
		document.fire( 'damas:link' );
		return req.transport.status == 200;
	}

	/**
	 * Retrieve the elements linked to the specified element
	 * @param {Array} indexes array of node ids to retrieve
	 * @returns {Array} array of Damas elements
	 */
	damas.links = function ( id )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { 'cmd': 'links', 'id': id }
		});
		return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) );
	}

	/**
	 * List all distinct values for a key
	 */
	damas.list = function ( key )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: key? { 'cmd': 'list', 'key': key } : { 'cmd': 'list' }
		});
		return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) );
	}

	/**
	 * Move the specified element to trashcan element ( id=dam:trashcan ) .
	 * If trashcan is not found it is created under the root element.
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.recycle = function ( id )
	{
		var req = new Ajax.Request( this.server + "/asset.json.php", {
			asynchronous: false,
			parameters: { cmd: 'recycle', id: id }
		});
		if( req.transport.status == 200 )
		{
			document.fire( 'dam:element.recycled', id );
		}
		return req.transport.status == 200;
	}

	/**
	 * Recursively modify a node, searching and replacing a specified pattern in its sub key values
	 * @param {Integer} id Node index to modify
	 * @param {String} old_pattern Name of the attribute
	 * @param {String} value Value of the attribute
	 * @returns {Boolean} true on success, false otherwise
	 */
	/*
	damas.setKeys = function ( id, old_pattern, new_pattern )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'setKeys', id: id, old: old_pattern, 'new': new_pattern }
		});
		if( req.transport.status == 200 )
		{
			document.fire('dam:element.updated', { 'id': id } );
		}
		return req.transport.status == 200;
	}
	*/

	/**
	 * Make an exact copy of an element
	 * @param {Integer} id Element Index
	 * @returns {DamNode} New node on success, false otherwise
	 */
	/*
	damas.duplicate = function ( id )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { 'cmd': 'duplicate', 'id': id }
		});
		return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ) );
	}
	*/

	/**
	 * Creates a node using an existing node as template.
	 * @param {Integer} id Template node index
	 * @param {Integer} target Parent node index
	 * @param {Hash} keys Hash of key/value pairs
	 * @param {String} tags Comma separated tags string
	 * @returns {Object} the newly created element
	 */
	/*
	damas.createFromTemplate = function ( id, target, keys, tags )
	{
		var newnode = damas.duplicate( id );
		if( newnode.parent_id !== target )
		{
			newnode.move( target );
		}
		$H( keys ).each( function(pair) {
			newnode.setKey( pair.key, pair.value );
		});
		$H( keys ).each( function(pair) {
			damas.setKeys( newnode.id, '{@' + pair.key + '}', pair.value );
		});
		newnode.setTags( tags );
		document.fire('dam:element.updated', { 'id': target } );
		return newnode;
	}
	*/


	/**
	 * Set multiple tags at a time on the specified element
	 * @param {String} tags The coma separated tags to set
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.setTags = function ( id, tags )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'setTags', id: id, tags: tags }
		});
		return req.transport.status == 200;
	}

	/**
	 * Tag elements
	 * @param {Integer} id Element index
	 * @param {String} name Tag name
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.tag = function ( id, name )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'tag', id: id, name: name }
		});
		return req.transport.status == 200;
	}

	/**
	 * Untag elements
	 * @param {Integer} id Element index
	 * @param {String} name Tag name
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.untag = function ( id, name )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'untag', id: id, name: name }
		});
		return req.transport.status == 200;
	}

	/**
	 * Remove a link
	 * @param {Integer} id Index of a link
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.unlink = function ( id )
	{
		var req = new Ajax.Request( this.server + "/model.json.php", {
			asynchronous: false,
			parameters: { cmd: 'unlink', id: id }
		});
		document.fire( 'damas:unlink' );
		return req.transport.status == 200;
	}

	/**
	 * Methods to process data, serialize/deserialize, filter, sort
	 * @namespace
	 * @requires prototypejs.Ajax
	 */
	damas.utils = {};

	//
	//
	//
	//
	// COMMUNICATION WITH SERVER
	//
	//
	//
	//

	/**
	 * Send a command to the server
	 * Ajax commands are invoked synchronously in order to use the return value
	 * @param {Hash} args comment arguments
	 * @return {Hash} hash containing response status, text
	 */
	damas.utils.command = function ( args )
	{
		var req = new Ajax.Request( damas.server + "/model.json.php", {
			asynchronous: false,
			parameters: args
		});
		return { 'status': req.transport.status, text: req.transport.responseText };
	}

	/**
	 * Send an asynchrone command to the server
	 * @param {Hash} args comment arguments
	 * @param {Function} callback the function to call on command success
	 */
	damas.utils.command_a = function ( args, callback )
	{
		var req = new Ajax.Request( damas.server + "/model.json.php", {
			asynchronous: true,
			parameters: args,
			onSuccess: function( req ){
				callback( { 'status': req.transport.status, text: req.transport.responseText } );
			}
		});
	}

	//
	//
	//
	//
	// SORT AND FILTER ELEMENTS
	//
	//
	//
	//
	//

	/**
	 * Remove the specified type from an array of elements
	 * @param {Array} elements elements to filter
	 * @returns {Array} the filtered array
	 */
	damas.utils.filter = function ( elements, type )
	{
		var res = new Array();
		for( var i=0; i< elements.length; i++ )
		{
			if( elements[i].type === type ) continue;
			res.push( elements[i] );
		}
		return res;
	}

	/**
	 * Keep the specified type from an array of elements
	 * @param {Array} elements elements to parse
	 * @param {String} type type name to keep
	 * @returns {Array} the filtered array
	 */
	damas.utils.keep = function ( elements, type )
	{
		var res = new Array();
		for( var i=0; i< elements.length; i++ )
		{
			if( elements[i].type === type )
				res.push( elements[i] );
		}
		return res;
	}

	/**
	 * Keep messages and elements with a time key from an array of elements
	 * @param {Array} elements elements to filter
	 * @returns {Array} the filtered array
	 */
	damas.utils.keep_timed = function ( elements )
	{
		var res = new Array();
		for( var i=0; i< elements.length; i++ )
		{
			if( elements[i].keys.get( 'time' ) || elements[i].type === 'message' )
				res.push( elements[i] );
		}
		return res;
	}

	/**
	 * Sort an array of elements, by type then by label
	 * @param {Array} elements Array of elements to sort
	 * @return {Array} sorted elements
	 */
	damas.utils.sort = function ( elements )
	{
		elements = elements.sort( function( e1, e2 ){
			if( e1.type < e2.type ) return -1;
			if( e1.type > e2.type ) return 1;
			if( e1.label().toLowerCase() < e2.label().toLowerCase() ) return -1;
			if( e1.label().toLowerCase() > e2.label().toLowerCase() ) return 1;
			return 0;
		});
		return elements;
	}

	/**
	 * Sort an array of elements by time
	 * @param {Array} elements Array of elements to sort
	 * @return {Array} sorted elements
	 */
	damas.utils.sort_time_desc = function ( elements )
	{
		return elements.sort( function( m1, m2 ) {
			if( !m1.keys.get( 'time' ) ) return -1;
			if( !m2.keys.get( 'time' ) ) return 1;
			if( m1.keys.get( 'time' ) < m2.keys.get( 'time' ) ) return 1;
			if( m1.keys.get( 'time' ) > m2.keys.get( 'time' ) ) return -1;
			return 0;
		});
	}

	//
	//
	//
	//
	// PROCESS SERVER RESULTS
	//
	//
	//
	//

	/**
	 * Deserialize JSON objects to Damas elements
	 * @param {Object} obj json object to read
	 * @return list of deserialized elements
	 */
	damas.utils.readJSONElements = function ( obj )
	{
		$A( obj ).each( function( e ){
			damas.utils.readJSONElement( e );
		} );
		return obj;
	}

	/**
	 * Deserialize a JSON object to a Damas element
	 * @param {Object} obj json object to read
	 * @return the deserialized element
	 */
	damas.utils.readJSONElement = function ( obj )
	{
		obj.keys = $H( obj.keys );
		obj.tags = $A( obj.tags );
		//return Object.extend( obj, new damas.element() );
		return Object.extend( obj, damas.element );
	}


	/**
	 * Damas node elements
	 * custom events : dam:element.updated, inserted, recycled
	 * @class
	 * @requires prototypejs
	 * @_param {Object} id Index, damas.element, or XML fragment
	 * @property {Array} children children elements
	 * @property {Integer} id Index number of the element
	 * @property {Hash} keys Attributes of the element
	 * @property {Array} tags Tags of the element
	 * @property {String} type Type name of the element
	 * @memberof damas
	 */
	damas.element = {};

	/**
	 * @private
	 */
	damas.element.initialize = function ( id )
	{
		if( id && id.id)
		{
			this.copy(id);
			return;
		}
		if( Object.isString(id) || Object.isNumber(id))
		{
			this.id = id;
			return;
		}
		if( Object.isElement(id))
		{
			this.readXML(id);
			this.extendme();
			return;
		}
	}

	/**
	 * Copies properties from another element object
	 * @private
	 * @param {damas.element} elem Element to copy
	 */
	damas.element.copy = function ( elem )
	{
		if( !elem) return;
		this.id = elem.id;
		this.type = elem.type;
		this.keys = $H(elem.keys);
		this.tags = elem.tags;
		this.single = elem.single;
		this.children = elem.children;
		this.links = elem.links;
		this.tagName = elem.tagName;
		this.extendme();
	}

	/**
	 * Extends the element methods and properties according to its type and the types defined in damas.types
	 * @private
	 */
	damas.element.extendme = function ()
	{
		var obj = damas.types[this.type] ? damas.types[this.type] : damas.types['dam:element'];
		if( obj )
			Object.extend(this, new obj());
		return this;
	}

	/**
	 * Get a printable representation string of the element
	 * @returns {String} a string representing the element
	 */
	damas.element.print = function ()
	{
		var txt = this.type;
		if( this.tags.length > 0 )
		{
			txt += ' [';
			for( i = 0; i < this.tags.length - 1 ; i++ )
			{
				txt += this.tags[i] + ', ';
			}
			txt += this.tags[ this.tags.length -1 ] + ']';
		}
		var keys = this.keys.keys();
		if( keys.length > 0 )
		{
			txt += ' {';
			for( i = 0; i < keys.length - 1 ; i++ )
			{
				txt += " " + keys[i] + ":'" + this.keys.get( keys[i] ) + "', ";
			}
			txt += keys[keys.length - 1] + ":'" + this.keys.values().last() + "' }";
		}
		return txt;
	}

	/**
	 * Add a new sub node
	 * @instance
	 * @param {String} type Type of the element
	 * @param {Hash} keys the key/value pairs to set on the new node
	 * @returns {damas.element} The newly created element.
	 */
	damas.element.create = function ( keys )
	{
		keys['#parent'] = this.id;
		var res = damas.create(keys);
		if( res ) document.fire('dam:element.inserted', res);
		return res;
	}

	/**
	 * NEED DOC
	 * TODO MUST set update keys on node!!
	 */
	damas.element.update = function ( keys, callback )
	{
		return damas.update( this.id, keys, callback );
	}

	/**
	 * Make an exact copy of the element
	 * @returns {damas.element} new node on success, false otherwise.
	 */
	damas.element.duplicate = function ()
	{
		return damas.duplicate( this.id );
	}

	/**
	 * Move the element
	 * @param {Integer} index number of the new parent or 0
	 * @returns {Boolean} true on success, false otherwise.
	 */
	damas.element.move = function ( target )
	{
		var res = damas.move(this.id, target);
		if( res ) document.fire('damas:element.updated', this);
		return res;
	}

	/**
	 * Set element tags with a comma separated tag list
	 * @param {String} tags Comma separated tags
	 * @returns {Boolean} true on success, false otherwise.
	 */
	damas.element.setTags = function ( tags )
	{
		var res = damas.setTags( this.id, tags );
		if( res ) document.fire( 'dam:element.updated', this );
		return res;
	}

	/**
	 * Tag the element
	 * @param {String} name Tag name
	 * @returns {Boolean} true on success, false otherwise.
	 */
	damas.element.tag = function ( name )
	{
		var res = damas.tag(this.id, name);
		if( res ) document.fire('dam:element.updated', this);
			return res;
	}

	/**
	 * Remove a tag from the element
	 * @param {String} name Tag name
	 * @returns {Boolean} true on success, false otherwise.
	 */
	damas.element.untag = function ( name )
	{
		var res = damas.untag(this.id, name);
		if( res ) document.fire('dam:element.updated', this);
		return res;
	}

	/**
	 * Move the element to the trashcan element ( id=dam:trashcan ) .
	 * If the trashcan is not found it is created under the root element.
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.element.recycle = function ()
	{
		var req = new Ajax.Request( damas.server + "/asset.json.php", {
			asynchronous: false,
			parameters: { cmd: 'recycle', id: this.id }
		});
		if( req.transport.status == 200 )
		{
			document.fire( 'dam:element.recycled', this );
		}
		return req.status == 200;
	}

	/**
	 * Insert a message on the element. The message stores time, user, and text
	 * @param {String} text text for the new message
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.element.write = function ( text )
	{
		var req = new Ajax.Request( damas.server + "/asset.json.php", {
			asynchronous: false,
			parameters: { cmd: 'write', id: this.id, text: text }
		});
		if( req.transport.status != 200 ){
			return false;
		}
		return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ) );
		//document.fire( 'dam:element.updated', this );
	}

	/**
	 * Insert/update the time key of an element
	 * @returns {Boolean} true on success, false otherwise
	 */
	damas.element.time = function ( )
	{
		var req = new Ajax.Request( damas.server + "/asset.json.php", {
			asynchronous: false,
			parameters: { cmd: 'time', id: this.id }
		});
		if( req.status == 200 )
		{
			document.fire( 'dam:element.updated', this );
		}
		return req.status == 200;
	}

	return damas;
}));
