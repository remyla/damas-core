/**
 * @fileoverview Javascript methods and objects for DAMAS software (damas-software.org)
 *
 * @author Remy Lalanne
 *
 * Copyright 2005-2012 Remy Lalanne
 *
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
 * along with damas-core.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *
 * 2012-10-23 removed project.getElementByTagName()
 * 2012-09-12 added project.find()
 * 2012-09-12 added project.findTag()
 * 2012-09-12 added project.findSQL()
 * 2012-09-12 removed project.getElementsByTagName()
 * 2012-09-12 removed project.getNodesBySQL()
 * 2012-09-12 removed project.getNodesByTag()
 */

/**
 * Static library with methods for Digital Asset Management
 * @namespace
 * @requires damas.serverRequest
 * @requires damas.log
 * @property {Array} errors DAMAS Error codes definitions
 * @property {String} server The currently connected DAMAS server URL
 * @property {Hash} types A Hash of the different Damas Element types defined
 * @property {String} version The version of DAMAS which is running
 */
var damas = {};

damas.server = '';
damas.types = {};
damas.version = '2.2-beta6';

damas.log = app.log;

damas.errorCode = function ( text )
{
	return this.errors.indexOf( text );
}

damas.errorText = function ( code )
{
	return this.errors[code];
}

damas.errors = new Array();

/* client */
damas.errors[500] = "ERR_CONF";
damas.errors[502] = "ERR_SERVER";
damas.errors[504] = "ERR_SERVERRESPONSE";
damas.errors[505] = "ERR_PLUGIN";
damas.errors[506] = "ERR_AJAX";
damas.errors[507] = "ERR_VERSION";

/* server */
damas.errors[0] = "ERR_NOERROR";
//damas.errors[6] = "ERR_SERVER_CONF";
damas.errors[1] = "ERR_COMMAND";
//damas.errors[2] = "ERR_AUTHREQUIRED";
damas.errors[3] = "ERR_PERMISSION";
//damas.errors[4] = "ERR_AUTH";
//damas.errors[5] = "ERR_LOGOUT";

//damas.errors[10] = "ERR_MYSQL_SUPPORT";
//damas.errors[11] = "ERR_MYSQL_SERVER";
//damas.errors[12] = "ERR_MYSQL_CONNECT";
//damas.errors[13] = "ERR_MYSQL_DB";
damas.errors[14] = "ERR_MYSQL_QUERY";

damas.errors[30] = "ERR_NODE_ID";
damas.errors[31] = "ERR_NODE_CREATE";
damas.errors[32] = "ERR_NODE_UPDATE";
damas.errors[33] = "ERR_NODE_MOVE";
damas.errors[34] = "ERR_NODE_DELETE";

damas.errors[70] = "ERR_FILE_NOT_FOUND";
damas.errors[71] = "ERR_FILE_PERMISSION";
damas.errors[72] = "ERR_FILE_EMPTYDIR";
damas.errors[73] = "ERR_FILE_UPLOAD";
damas.errors[74] = "ERR_FILE_EXISTS";

damas.errors[100] = "ERR_ASSET_LOCK";
damas.errors[101] = "ERR_ASSET_UNLOCK";
damas.errors[102] = "ERR_ASSET_SAVEABLE";
damas.errors[103] = "ERR_ASSET_BACKUP";
damas.errors[104] = "ERR_ASSET_UPDATE";
damas.errors[105] = "ERR_ASSET_UNDOBACKUP";
damas.errors[106] = "ERR_ASSET_ROLLBACK";
damas.errors[107] = "ERR_ASSET_NOSHA1";
damas.errors[108] = "ERR_ASSET_FILECHECK";
damas.errors[109] = "ERR_ASSET_READONLY";

/**
 * Communication
 * Errors handling
 * Events
 */
damas.post = function ( url, args ) {
	var req = new Ajax.Request( url, {
		asynchronous: false,
		parameters: args,
		onFailure: damas.onFailure,
		onException: damas.onException
	});
	return serverResponseHandle.decomposeResponse( req.transport.responseXML );
}

/**
 * Search database tags and keys for a specified text
 * @returns {Boolean} true on success, false otherwise
 */
damas.search = function ( searchtext )
{
	damas.log.cmd('damas.search', arguments );
	document.fire('dam:submit.search', {'value': searchtext.substring(0, (searchtext.indexOf('&') == -1?searchtext.length: searchtext.indexOf('&')))} );
}



/**
 * Methods to process data, serialize/deserialize, filter, sort
 */
damas.utils = {};

// SORT AND FILTER ELEMENTS

/**
 * Filter messages and tasks from an array of elements
 * @param {Array} elements elements to filter
 * @returns {Array} the filtered array
 */
damas.utils.filter = function ( elements )
{
	var res = new Array();
	for( var i=0; i< elements.length; i++ )
	{
		if( elements[i].type === 'message' ) continue;
		res.push( elements[i] );
	}
	return res;
}

/**
 * Keep a specified type from an array of elements
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
    elements = elements.sort( function( e1, e2 )
    {
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

/**
 * Deserialize JSON objects to Damas elements
 * @private
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
 * @private
 * @param {Object} obj json object to read
 * @return the deserialized element
 */
damas.utils.readJSONElement = function ( obj )
{
	obj.keys = $H( obj.keys );
	obj.tags = $A( obj.tags );
	return Object.extend( obj, new damas.element() );
}

/**
 * Reads properties from a JSON
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 */
/*
damas.element.readChildrenJSON = function ( obj )
{
	this.children = $A( obj );
	this.children.each( function( c ){
		c.parent_id = this.id;
		c.keys = $H( c.keys );
		c.tags = $A( c.tags );
		Object.extend( c, new damas.element() );
	}.bind( this ) );
	damas.utils.sort( this.children );
	return;
}
*/

/**
 * Reads properties from an XML fragment
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 */
/*
damas.element.readXML = function ( XMLElement )
{
	this.single = XMLElement;
	this.id = parseInt( XMLElement.getAttribute( 'id' ) );
	this.parent_id = parseInt( XMLElement.getAttribute( 'parent_id' ) );
	this.parent_id = ( isNaN( this.parent_id ) )? undefined : this.parent_id;  //parent_id is a number or undefined if root
	this.type = XMLElement.getAttribute('type');
	this.keys = new Hash();
	this.tags = new Array();
	this.childcount = XMLElement.getAttribute("childcount");
	this.link_id = parseInt( XMLElement.getAttribute('link_id') );
	var keys = XMLElement.getElementsByTagName("key");
	for( var i=0; i < keys.length; i++ )
	{
		this.keys.set( keys[i].getAttribute('name'), ( keys[i].firstChild ) ? keys[i].firstChild.data : ' ' );
		//var tmp = keys[i].firstChild;
		//if( tmp ) this.keys.set( keys[i].getAttribute('name'), tmp.data );
		//else this.keys.set( keys[i].getAttribute('name'), '' );
	}
	var tags = XMLElement.getElementsByTagName("tag");
	//var tags = XMLElement.selectNodes("tag");
	for( var i=0; i<tags.length; i++ )
	{
		//var tmp = tags[i].firstChild;
		//if( tmp ) this.tags.push(tmp.data);
		this.tags.push( ( tags[i].firstChild )? tags[i].firstChild.data : ' ' );
	}
	this.tagName = XMLElement.tagName;
}
*/

/**
 * Reads properties from a SOAP XML fragment
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 */
/*
damas.element.readChildrenXML = function ( XMLElement )
{
	this.children_xml = XMLElement;
	this.children = $A();
	this.links = $A();
	this.rlinks = $A();
	$A( XMLElement.getElementsByTagName('returnvalue')[0].childNodes).each( function ( c ){
		var elem = new damas.element(c).extendme();
		if( c.nodeName == 'node' ){
		//if( c.nodeName == 'node' | c.nodeName == 'link' | c.nodeName == 'rlink' ){
			this.children.push( elem );
		}
		if( c.nodeName == 'link' ){
			this.links.push( elem );
		}
		if( c.nodeName == 'rlink' ){
			this.rlinks.push( elem );
		}
	}.bind( this ) );
	damas.utils.sort( this.children );
	damas.utils.sort( this.links );
}
*/




/**
 * Methods to interact with a remote DAMAS project.
 *
 * Usage:
 * var proj = new damas.project( "https://server/" );
 *
 * @namespace
 * @requires Ajax
 * @requires damas.serverRequest
 * @requires damas.log
 * @requires damas.element
 */
damas.project = {};

/**
 * Constructor
 * @param {String} url The server to connect to
 */
damas.project.initialize = function ( url )
{
	this.server = url;
}

/**
 * Retrieve the ancestors (parent and above) of a node
 * @param {Integer} id node index
 * @return {Array} array of ancestors ids
 */
damas.project.ancestors = function ( id )
{
	return damas.utils.readJSONElements( JSON.parse( this.command( { cmd: 'ancestors', id: id } ).text ) );
}

/**
 * Retrieve the children of a node
 * @param {Integer} id node index
 * @return {Array} array of children elements
 */
damas.project.children = function ( element )
{
	element.children = damas.utils.readJSONElements( JSON.parse( this.command( { cmd: 'children', id: id } ).text ) );
	return element.children;
}

/**
 * Send a command to the server
 * Ajax commands are invoked synchronously in order to use the return value
 * @param {Hash} args comment arguments
 * @return {Hash} hash containing response status, text
 */
damas.project.command = function ( args )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
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
damas.project.command_a = function ( args, callback )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: true,
		parameters: args,
		onSuccess: function( req ){
			callback( { 'status': req.transport.status, text: req.transport.responseText } );
		}
	});
}

/**
 * Creates a node using an existing node as template.
 * @param {Integer} id Template node index
 * @param {Integer} target Parent node index
 * @param {Hash} keys Hash of key/value pairs
 * @param {String} tags Comma separated tags string
 * @returns {Object} the newly created element
 */
damas.project.createFromTemplate = function ( id, target, keys, tags )
{
	damas.log.cmd( "damas.project.createFromTemplate", arguments );
	var newnode = project.duplicate( id );
	if( newnode.parent_id !== target )
	{
		newnode.move( target );
	}
	$H( keys ).each( function(pair) {
		newnode.setKey( pair.key, pair.value );
	});
	$H( keys ).each( function(pair) {
		project.setKeys( newnode.id, '{@' + pair.key + '}', pair.value );
	});
	newnode.setTags( tags );
	document.fire('dam:element.updated', { 'id': target } );
	return newnode;
}

/**
 * Creates a node of the specified type
 * @param {Integer} id Parent node index
 * @param {String} tagName type of the new node
 * @returns {DamNode} New node on success, false otherwise
 */
damas.project.createNode = function ( id, tagName )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { 'cmd': 'createNode', 'id': id, 'type': tagName }
	});
	return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ) );
}

/**
 * Make an exact copy of an element
 * @param {Integer} id Element Index
 * @returns {DamNode} New node on success, false otherwise
 */
damas.project.duplicate = function ( id )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { 'cmd': 'duplicate', 'id': id }
	});
	return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ) );
}

/**
 * Remove every elements from the trashcan.
 * Privileged 'admin' users only.
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.empty_trashcan = function ( )
{
	damas.log.cmd( "project.empty_trashcan", arguments );
	var req = new Ajax.Request( this.server + "/asset.json.php", {
		asynchronous: false,
		parameters: { cmd: 'empty_trashcan' }
	});
	if( req.transport.status == 200 )
	{
		document.fire( 'dam:element.updated', this.find( { 'id': 'dam:trash' } ) );
	}
	return req.transport.status == 200;
}

/**
 * Find elements wearing the specified key(s)
 * @param {Hash} keys Hash of key/value pairs to match
 * @returns {Array} array of element indexes or null if no element found
 */
damas.project.find = function ( keys )
{
	damas.log.cmd( "damas.project.find", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: Object.extend( keys, { cmd: 'find' } )
	});
	return JSON.parse( req.transport.responseText );
}

/**
 * Find elements, specifying an SQL SELECT query.
 * The query must be formated to return results with an 'id' named column, which
 * contains elements indexes.
 * @param {String} query SQL query to perform
 * @returns {Array} array of element indexes
 */
damas.project.findSQL = function ( query )
{
	damas.log.cmd( "damas.project.findSQL", arguments );
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
damas.project.findTag = function ( tagname )
{
	damas.log.cmd( "damas.project.findTag", arguments );
	return project.findSQL( "SELECT node.id FROM node LEFT JOIN tag ON node.id=tag.node_id WHERE tag.name='" + tagname + "' ORDER BY node.type;" );
}

/**
 * Retrieve an element specifying its internal node index
 * @param {Integer} index the internal node id to search
 * @returns {damas.element} Damas element or false on failure
 */
damas.project.getNode = function ( index )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { 'cmd': 'single', 'id': index }
	});
	return damas.utils.readJSONElement( JSON.parse( req.transport.responseText ) );
}

/**
 * Retrieve elements specifying their internal node indexes
 * @param {Array} indexes array of node ids to retrieve
 * @returns {Array} array of Damas elements
 */
damas.project.getNodes = function ( indexes )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		method: "POST",
		asynchronous: false,
		parameters: { cmd: "multi", id: indexes.join( "," ), depth: "1", flags: "4" }
	});
	return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) );
}

/**
 * Make a link
 * @param {Integer} src_id Source element index
 * @param {Integer} tgt_id Target element index
 * @returns {Integer} link index on success, false otherwise
 */
damas.project.link = function ( src_id, tgt_id )
{
	damas.log.cmd( "damas.project.link", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'link', src: src_id, tgt: tgt_id }
	});
	document.fire( 'damas:project.link' );
	return req.transport.status == 200;
}

/**
 * Retrieve the elements linked to the specified element
 * @param {Array} indexes array of node ids to retrieve
 * @returns {Array} array of Damas elements
 */
damas.project.links = function ( id )
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
damas.project.list = function ( key )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: key? { 'cmd': 'list', 'key': key } : { 'cmd': 'list' }
	});
	return damas.utils.readJSONElements( JSON.parse( req.transport.responseText ) );
}

/**
 * Move elements
 * @param {Integer} id Element index
 * @param {Integer} target Index of the new parent element
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.move = function ( id, target )
{
	damas.log.cmd( "damas.project.move", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'move', id: id, target: target }
	});
	return req.transport.status == 200;
}

/**
 * Move the specified element to trashcan element ( id=dam:trashcan ) .
 * If trashcan is not found it is created under the root element.
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.recycle = function ( id )
{
	damas.log.cmd( "project.recycle", arguments );
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
 * Removes an attribute by name
 * @param {Integer} id Element index
 * @param {String} name Name of the attribute
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.removeKey = function ( id, name )
{
	damas.log.cmd( "damas.project.removeKey", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'removeKey', id: id, name: name }
	});
	return req.transport.status == 200;
}

/**
 * Recursively delete the specified node
 * @param {Integer} id Element index to delete
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.removeNode = function ( id )
{
	damas.log.cmd( "damas.project.removeNode", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { 'cmd': 'removeNode', 'id': id }
	});
	return req.transport.status == 200;
}

/**
 * Adds a new attribute. If an attribute with that name is already present in
 * the element, its value is changed to be that of the value parameter
 * @param {Integer} id Element index
 * @param {String} name Name of the attribute
 * @param {String} value Value of the attribute
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.setKey = function ( id, name, value )
{
	damas.log.cmd( "project.setKey", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'setKey', id: id, name: name, value: value }
	});
	return req.transport.status == 200;
}

/**
 * Recursively modify a node, searching and replacing a specified pattern in its sub key values
 * @param {Integer} id Node index to modify
 * @param {String} old_pattern Name of the attribute
 * @param {String} value Value of the attribute
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.setKeys = function ( id, old_pattern, new_pattern )
{
	damas.log.cmd( "project.setKeys", arguments );
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

/**
 * Set multiple tags at a time on the specified element
 * @param {String} tags The coma separated tags to set
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.setTags = function ( id, tags )
{
	damas.log.cmd( "project.setTags", arguments );
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
damas.project.tag = function ( id, name )
{
	damas.log.cmd( "damas.project.tag", arguments );
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
damas.project.untag = function ( id, name )
{
	damas.log.cmd( "damas.project.untag", arguments );
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
damas.project.unlink = function ( id )
{
	damas.log.cmd( "damas.project.unlink", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'unlink', id: id }
	});
	document.fire( 'damas:project.unlink' );
	return req.transport.status == 200;
}

/**
 * Change an element type
 * @param {Integer} id Element index
 * @param {String} type New type
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.setType = function ( id, type )
{
	damas.log.cmd( "project.setType", arguments );
	var req = new Ajax.Request( this.server + "/model.json.php", {
		asynchronous: false,
		parameters: { cmd: 'setType', id: id, type: type }
	});
	return req.transport.status == 200;
}


damas.project = Class.create( damas.project );



/**
 * Elements of a Damas project
 * custom events : dam:element.updated, inserted, recycled
 * @class
 * @requires damas.project
 * @requires damas.log
 * @requires ServerRequest
 * @requires errors
 * @_param {Object} id Index, damas.element, or XML fragment
 * @property {Array} children children elements
 * @property {Integer} id Index number of the element
 * @property {Hash} keys Attributes of the element
 * @property {Integer} parent_id The index of the parent element, or undefined
 * @property {Array} tags Tags of the element
 * @property {String} type Type name of the element
 *
 * @ private:
 * @_property {XML Document} single XML fragment describing the element.
 * @_property {XML Document} children XML fragment describing the children of the element.
 *
 * @ obsolete:
 * @_property {Integer} previous_id The index of the element immediately preceding this element. If there is no such node, this is null.
 * @_property {Integer} next_id The index of the element immediately following this element. If there is no such node, this is null.
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
		//this.getSingle();
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
 * @param {Object} elem Element to copy
 */
damas.element.copy = function ( elem )
{
	if( !elem) return;
	this.id = elem.id;
	this.type = elem.type;
	this.parent_id = elem.parent_id;
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
 * @param {String} type Type of the element
 * @returns {DAM Element} The newly created element.
 */
damas.element.createNode = function ( type )
{
	var res = project.createNode( this.id, type );
	if( res ) document.fire( 'dam:element.inserted', res );
       return res;
}

/**
 * Make an exact copy of the element
 * @returns {damNode} new node on success, false otherwise.
 */
damas.element.duplicate = function ()
{
	return project.duplicate( this.id );
}

/**
 * Move the element
 * @param {Integer} index number of the new parent or 0
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.move = function ( parent_id )
{
	var res =  project.move(this.id, parent_id);
	if( res ) document.fire('dam:element.updated', this);
       return res;
}

/**
 * Delete the element
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.remove = function ()
{
	//damas.log.cmd("this.remove",arguments);
	var res = project.removeNode( this.id );
	if( res ) document.fire('dam:element.updated', this);
       return res;
}

/**
 * Remove a key from the element
 * @param {String} name Name of the attribute
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.removeKey = function ( name )
{
	var res = project.removeKey( this.id, name );
	if( res ) document.fire('dam:element.updated', this);
       return res;
}

/**
 * Add a new key on the element. If an attribute with that name is already present in the element, its value is changed to be that of the value parameter. This value is a simple string; it is not parsed as it is being set. So any markup (such as syntax to be recognized as an entity reference) is treated as literal text, and needs to be appropriately escaped by the implementation when it is written out.
 * @param {String} name Name of the attribute
 * @param {String} value Value of the attribute
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.setKey = function ( name, value )
{
	var res = project.setKey( this.id, name, value );
	if( res ) document.fire( 'dam:element.updated', this);
       return res;
}

/**
 * Set element tags with a comma separated tag list
 * @param {String} tags Comma separated tags
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.setTags = function ( tags )
{
	var res = project.setTags( this.id, tags );
	if( res ) document.fire( 'dam:element.updated', this );
       return res;
}

/**
 * Set the element type
 * @param {String} newtype Type
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.setType = function ( newtype )
{
	var res = project.setType(this.id, newtype);
	if( res ) document.fire('dam:element.updated', this);
	return res;
}

/**
 * Tag the element
 * @param {String} name Tag name
 * @returns {Boolean} true on success, false otherwise.
 */
damas.element.tag = function ( name )
{
	var res = project.tag(this.id, name);
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
	var res = project.untag(this.id, name);
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
	damas.log.cmd( "that.recycle", arguments );
	var req = new Ajax.Request( project.server + "/asset.json.php", {
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
	damas.log.cmd( "that.write", arguments );
	var req = new Ajax.Request( project.server + "/asset.json.php", {
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
	damas.log.cmd( "that.time", arguments );
	var req = new Ajax.Request( project.server + "/asset.json.php", {
		asynchronous: false,
		parameters: { cmd: 'time', id: this.id }
	});
	if( req.status == 200 )
	{
		document.fire( 'dam:element.updated', this );
	}
	return req.status == 200;
}

//damas.element = Class.create( damas.element );

/**
 * @fileoverview SOAP messages and Ajax queries handling
 *
 * @author Remy Lalanne
 * Copyright 2005-2012 Remy Lalanne
 */

/**
 * Handle XML responses and errors from server
 * @namespace
 * @requires errors
 * @requires serverResponse
 */
serverResponseHandle = {
	/**
	 * Extract the version of server from its response
	 * @param {object} XMLResponse XML response document from server
	 * @return {Hash} Server response hash
	 */
	decomposeResponse: function ( responseXML ) {
		var xml = false;
		var txt = false;
		var err = this.notifyError(responseXML);
		if (damas.errorText(err) == "ERR_NOERROR"){
			body = serverResponse.getServerReturnDom(responseXML);
			txt = serverResponse.getServerReturn(responseXML);
			return { 'bool':true, 'error':err, 'xml':responseXML, 'body':body, 'text':txt };
		}
		return { 'bool':false, 'error':err, 'xml':null, 'body':null, 'text':null }
	},
	notifyError: function ( responseXML ) {
		var error_code = this.checkResponse(responseXML);
		if ( damas.errorText(error_code)!="ERR_NOERROR" )
		{
			document.fire( 'err:all', error_code );
		}
		document.fire( 'err:' + damas.errorText(error_code), error_code );
		return error_code;
	},
	checkResponse: function ( XMLResponse ) {
		var err = damas.errorCode("ERR_NOERROR");
		if( XMLResponse == null )
			return damas.errorCode("ERR_SERVER");
		var version = serverResponse.getServerVersion(XMLResponse);
		if (!version)
			return damas.errorCode("ERR_SERVERRESPONSE");
		if ( version != damas.version )
			return damas.errorCode("ERR_VERSION");
		err = serverResponse.getServerError(XMLResponse);
		if ( err === false)
			return damas.errorCode("ERR_SERVERRESPONSE");
		return err;
	}
};

/**
 * Extract data from server's SOAP XML responses
 * @namespace
 */
serverResponse = {
	/**
	 * Extract the version of server from its response
	 * @param {object} XMLResponse XML response document from server
	 * @returns {String} the version string, false on failure
	 */
	getServerVersion: function ( XMLResponse ) {
		if (!XMLResponse) return false;
		var tags = XMLResponse.getElementsByTagName('version');
		if (tags.length==0) return false;
		if (!tags[0].firstChild) return false;
		return tags[0].firstChild.data;
	},
	/**
	 * Extract the error code from a server response
	 * @param {object} XMLResponse XML response document from server
	 * @returns {Integer} the error code found in server response, or false on failure
	 */
	getServerError: function ( XMLResponse ) {
		if (!XMLResponse) return false;
		// *** XPATH disabled (HTML DOM method instead) ***
		//var cod = XMLResponse.selectSingleNode("//error/@code");
		//if (!cod) return false;
		//return parseInt(cod.nodeValue);
		var cod = false;
		var err = XMLResponse.getElementsByTagName('error')[0];
		for(var i=0; i<err.attributes.length; i++){
			if (err.attributes[i].nodeName == "code")
				return parseInt( err.attributes[i].nodeValue);
		}
		return false;

	},
	/**
	 * Extract the returned value from a server response
	 * @param {object} xmldoc returned server response
	 * @returns {String} the return value found in server response
	 */
	getServerReturn: function ( XMLResponse ) {
		if (!XMLResponse) return false;
		var tags = XMLResponse.getElementsByTagName('returnvalue');
		if (tags.length==0) return false;
		if (!tags[0].firstChild) return false; // empty returnvalue
		return tags[0].firstChild.data;
	},
	/**
	 * Extract the returned value as DOM from a server response
	 * @param {object} xmldoc returned server response
	 * @returns {Dom} the return value found in server response, or false on failure
	 */
	getServerReturnDom: function ( XMLResponse ) {
		if (!XMLResponse) return false;
		var tags = XMLResponse.getElementsByTagName('returnvalue');
		if (tags.length==0) return false;
		//return tags[0];
		//return DOMParser.parseFromString(Sarissa.xmlize(tags[0]),"text/xml");
		return new DOMParser().parseFromString(new XMLSerializer().serializeToString(tags[0]),"text/xml");
	}
};
