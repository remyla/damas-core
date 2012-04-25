/**
 * @fileoverview Javascript methods and objects for DAMAS software (damas-software.org)
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
 * @author Remy Lalanne
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
damas.errors[6] = "ERR_SERVER_CONF";
damas.errors[1] = "ERR_COMMAND";
damas.errors[2] = "ERR_AUTHREQUIRED";
damas.errors[3] = "ERR_PERMISSION";
damas.errors[4] = "ERR_AUTH";
damas.errors[5] = "ERR_LOGOUT";

damas.errors[10] = "ERR_MYSQL_SUPPORT";
damas.errors[11] = "ERR_MYSQL_SERVER";
damas.errors[12] = "ERR_MYSQL_CONNECT";
damas.errors[13] = "ERR_MYSQL_DB";
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
 * Filter messages and tasks from an array of elements
 * @param {Array} elements elements to filter
 * @returns {Array} the filtered array
 */
damas.filter = function ( elements )
{
	var res = new Array();
	for( var i=0; i< elements.length; i++ )
	{
		if( elements[i].type === 'message' || elements[i].type === 'task' ) continue;
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
damas.keep = function ( elements, type )
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
 * Filter messages and tasks from an array of elements
 * @param {Array} elements elements to filter
 * @returns {Array} the filtered array
 */
damas.keep_timed = function ( elements )
{
	var res = new Array();
	for( var i=0; i< elements.length; i++ )
	{
		if( elements[i].keys.get( 'time' ) )
			res.push( elements[i] );
	}
	return res;
}

/**
 * Search database tags and keys for a specified text
 * @returns {Boolean} true on success, false otherwise
 */
damas.search = function ( searchtext )
{
	damas.log.cmd('damas.search', arguments );
	var sql = "SELECT DISTINCT node_id AS id FROM `key` WHERE value LIKE '%" + searchtext + "%';";
	var keys = project.getNodesBySQL(sql);
	var sql = "SELECT DISTINCT node_id AS id FROM tag WHERE name LIKE '%" + searchtext + "%';";
	var tags = project.getNodesBySQL(sql);
	damas.showMulti( keys.concat(tags) );
}

/**
 * Sort an array of elements, by type then by label
 * @param {Array} elements Array of elements to sort
 * @return {Array} sorted elements
 */
damas.sort = function ( elements )
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
damas.sort_time_desc = function ( elements )
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
 *
 * Errors handling
 *
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

damas.onFailure = function ( transport )
{
	alert( 'Failure!' );
	//alert( transport.status);
	//alert( transport.responseText );
	//alert( transport.headerJSON );
	//alert( transport.responseJSON );
	//document.fire( 'HTTPERROR', transport.status );
}

damas.onException = function ( response )
{
	alert( 'Exception!' );
}



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
 *
 * @param {String} url The server to connect to
 *
 */
damas.project.initialize = function ( url )
{
	damas.log.cmd( "damas.project", arguments );
	this.server = url;
	var r = damas.post( url + "/server.php", false );
	if( r.error != damas.errorCode( "ERR_NOERROR" ) )
	{
		return r.error;
	}
}

damas.project.modelRequest = function ( args )
{
	var req = new Ajax.Request( this.server + "/model.json.phpp", {
		asynchronous: false,
		parameters: args,
		onFailure: function( response ){
		}
	});
	alert( 'finished' );
	//return serverResponseHandle.decomposeResponse( req.transport.responseXML );
}

document.observe( 'HTTPERROR', function(e){
	alert( e );
} );

/**
 * Remove every elements from the trashcan.
 * Privileged 'admin' users only.
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.empty_trashcan = function ( )
{
	damas.log.cmd( "project.empty_trashcan", arguments );
	var args = { cmd: "empty_trashcan" };
	var res = damas.post( this.server + "/asset.soap.php", args ).bool;
	if( res ) document.fire('dam:element.updated', { 'id': this.getElementById('dam:trash').id } );
}

/**
 * Returns the first element which has the specified value of the ID attribute
 * @param {String} key key to search
 * @param {String} value key value to search
 * @returns {XML Fragment} XML of node
 */
damas.project.getElementById = function ( id )
{
	return this.searchKey( 'id', id )[0];
}

/**
 * Retrieve a Damas element specifying its internal node index
 * @param {Integer} index the internal node id to search
 * @returns {damas.element} DAMAS element or false on failure
 */
damas.project.getNode = function ( index )
{
	//damas.log.cmd( "damas.project.getNode", arguments );
	var args = { 'cmd': 'single', 'id': index };
	var req = new Ajax.Request( this.server + "/model.soap.php", { asynchronous: false, parameters: args } );
	var soap = req.transport.responseXML;
	return new damas.element( soap.getElementsByTagName( "node" )[0] );
}

damas.project.getAncestors = function ( id )
{
	var args = { 'cmd': 'ancestors', 'id': id };
	var req = new Ajax.Request( this.server + "/model.soap.php", { asynchronous: false, parameters: args } );
	var soap = req.transport.responseXML;
	var err = serverResponseHandle.notifyError( req.transport.responseXML );
	return project.readElementsXML( soap );
}

damas.project.getChildren = function ( element )
{
	//damas.log.cmd( "damas.project.getChildren", arguments );
	var args = { 'cmd': 'children', 'id': element.id };
	var req = new Ajax.Request( this.server + "/model.soap.php", { asynchronous: false, parameters: args } );
	var soap = req.transport.responseXML;
	var err = serverResponseHandle.notifyError( req.transport.responseXML );
	element.readChildrenXML( soap );
	return element.children;
	/*
	new Ajax.Request( project.server + "/model.soap.php", {
		parameters: { cmd: 'children', id: element.id },
		onSuccess: function( transport ) {
			var err = serverResponseHandle.notifyError( transport.responseXML );
			element.readChildrenXML( transport.responseXML );
			if( callback )
				callback();
			document.fire( 'damas:element.getchildren', this );
		}.bind(this)
	});
	*/
}

/**
 * Retrieve DAMAS elements specifying their internal node indexes
 * @param {Array} indexes array of node ids to retrieve
 * @returns {Array} array of XML fragments
 */
/*
damas.project.getNodes = function ( indexes )
{
	var req = new Ajax.Request( this.server + "/model.json.php", {
		method: "POST",
		asynchronous: false,
		parameters: { cmd: "multi", id: indexes.join( "," ), depth: "1", flags: "4" },
		//onFailure: damas.project.onFailure,
		//onException: damas.project.onFailure,
		onFailure: function ( transport ){
			alert( transport.status);
			alert( transport.responseText );
			alert( transport.headerJSON );
			alert( transport.responseJSON );
		},
		onException: function ( transport ){
			alert( transport.status);
			alert( transport.responseText );
			alert( transport.headerJSON );
			alert( transport.responseJSON );
		},
		onSuccess: function ( transport ){
			alert( transport.status);
			alert( transport.responseText );
			alert( transport.headerJSON );
			alert( transport.responseJSON );
		}
	});
	//return project.readElementsXML( req.transport.responseXML );
	alert( req.transport.status);
	alert( req.transport.responseText );
	alert( req.transport.headerJSON );
	alert( req.transport.responseJSON );
	return( eval( req.transport.responseText ) );
}
*/
damas.project.getNodes = function ( indexes )
{
	var req = new Ajax.Request( this.server + "/model.soap.php", {
		method: "POST",
		asynchronous: false,
		parameters: { cmd: "multi", id: indexes.join( "," ), depth: "1", flags: "4" }
	});
	return project.readElementsXML( req.transport.responseXML );
}

/**
 * Read many elements from an XML fragment
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 * @return {Array} array of elements
 */
damas.project.readElementsXML = function ( XMLElement )
{
	var nodes = XMLElement.getElementsByTagName( "node" );
	var elements = new Array();
	for( var i = 0; i < nodes.length; i++ )
	{
		elements[i] = new damas.element( nodes[i] ).extendme();
	}
	return elements;
}

/**
 * Returns elements wearing the specified key
 * @param {String} keyname key name to search
 * @param {String} keyvalue key value to search
 * @returns {XML Fragment} XML of node
 */
damas.project.searchKey = function ( keyname, keyvalue )
{
	damas.log.cmd( "damas.project.getNodeByKey", arguments );
	var args = { 'cmd': "searchKey", 'key': keyname, 'value': keyvalue };
	var nodes = damas.post( this.server + "/model.soap.php", args ).xml.getElementsByTagName( "node" );
	var elements = new Array();
	for( var i = 0; i < nodes.length; i++ )
	{
		elements[i] = new damas.element( nodes[i] );
	}
	return elements;
}

/**
 * Creates a node of the specified type
 * @param {Integer} id Parent node index
 * @param {String} tagName type of the new node
 * @returns {DamNode} New node on success, false otherwise
 */
damas.project.createNode = function ( id, tagName )
{
	damas.log.cmd( "damas.project.createNode", arguments );
	var args = { cmd: "createNode", id: id, type: tagName };
	//return damas.post( this.server + "/model.soap.php", args ).text;
	return new damas.element( damas.post( this.server + "/model.soap.php", args ).xml.getElementsByTagName( "node" )[0] );
}

/**
 * Make an exact copy of an element
 * @param {Integer} id Element Index
 * @returns {DamNode} New node on success, false otherwise
 */
damas.project.duplicate = function ( id )
{
	damas.log.cmd( "damas.project.duplicate", arguments );
	var args = { cmd: "duplicate", id: id };
	//return damas.post( this.server + "/model.soap.php", args ).text;
	return new damas.element( damas.post( this.server + "/model.soap.php", args ).xml.getElementsByTagName( "node" )[0] );
}

/**
 * Creates a node using an existing node as template.
 * @param {Integer} id Template node index
 * @param {Integer} target Parent node index
 * @param {Hash} keys Hash of key/value pairs
 * @param {String} tags Comma separated tags string
 * @returns {undefined}
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
}

/**
 * Move the specified element to trashcan element ( id=dam:trashcan ) .
 * If trashcan is not found it is created under the root element.
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.recycle = function ( id )
{
	damas.log.cmd( "damas.project.recycle", arguments );
	var args = { cmd: "recycle", id: id };
	return damas.post( this.server + "/asset.soap.php", args ).bool;
	//if( res ) document.fire( 'dam:element.recycled', this );
}

/**
 * Recursively delete the specified node
 * @param {Integer} id Element index to delete
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.removeNode = function ( id )
{
	damas.log.cmd( "damas.project.removeNode", arguments );
	var args = { cmd: "removeNode", id: id };
	return damas.post( this.server + "/model.soap.php", args ).bool;
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
	var args = { cmd: "setKey", id: id, name: name, value: value };
	return damas.post( this.server + "/model.soap.php", args ).bool;
	//var res = damas.post( damas.soap_srv, args ).bool;
	//if( res ) document.fire('dam:element.updated', { 'id': id, 'name': name, 'value': value } );
	//return res;
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
	var args = { cmd: "setKeys", 'id': id, 'old': old_pattern, 'new': new_pattern };
	var res = damas.post( this.server + "/model.soap.php", args ).bool;
	if( res ) document.fire('dam:element.updated', { 'id': id } );
	return res;
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
	var args = { cmd: "removeKey", id: id, name: name };
	return damas.post( this.server + "/model.soap.php", args ).bool;
	//var res = damas.post( damas.soap_srv, args ).bool;
	//if( res ) document.fire('dam:element.updated', { 'id': id, 'name': name } );
	//return res;
}

damas.project.setTags = function ( id, tags )
{
	damas.log.cmd( "project.setTags", arguments );
	var args = { cmd: "setTags", id: id, tags: tags };
	return damas.post( this.server + "/model.soap.php", args ).bool;
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
	var args = { cmd: "tag", id: id, name: name };
	return damas.post( this.server + "/model.soap.php", args ).bool;
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
	var args = { cmd: "untag", id: id, name: name };
	return damas.post( this.server + "/model.soap.php", args ).bool;
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
	var args = { cmd: "link", src: src_id, tgt: tgt_id };
	var res = damas.post( this.server + "/model.soap.php", args ).bool;
	document.fire( 'damas:project.link' );
	return res;
}

/**
 * Remove a link
 * @param {Integer} id Index of a link
 * @returns {Boolean} true on success, false otherwise
 */
damas.project.unlink = function ( id )
{
	damas.log.cmd( "damas.project.unlink", arguments );
	var args = { cmd: "unlink", id: id };
	var res = damas.post( this.server + "/model.soap.php", args ).bool;
	//if( res ) document.fire('damas.project.unlink', id );
	document.fire( 'damas:project.unlink' );
	return res;
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
	var args = { cmd: "setType", id: id, type: type };
	return damas.post( this.server + "/model.soap.php", args ).bool;
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
	var args = { cmd: "move", id: id, target: target };
	return damas.post( this.server + "/model.soap.php", args ).bool;
}

/**
 * Search for elements of the specified type
 * @param {String} type Type to search
 * @returns {Array} array of element indexes
 */
damas.project.getNodesByTagName = function ( tagName )
{
	damas.log.cmd( "damas.project.getNodesByTagName", arguments );
	var query = "SELECT node.id FROM node WHERE type='" + tagName + "';";
	return project.getNodesBySQL( query );
}

/**
 * Search for elements, specifying an SQL SELECT query.
 * The SQL SELECT query must be formated to return results with an 'id' field, which contains elements indexes.
 * @param {String} query SQL query to perform
 * @returns {Array} array of element indexes
 */
damas.project.getNodesBySQL = function ( query )
{
	damas.log.cmd( "damas.project.getNodesBySQL", arguments );
	var req = new Ajax.Request( this.server + "/mysql.soap.php", {
		asynchronous: false,
		parameters: { query: query }
	});
	var idtags = req.transport.responseXML.getElementsByTagName( 'id' );
	var ids = new Array();
	for( var i = 0; i < idtags.length; i++ )
		ids[i] = parseInt( idtags[i].firstChild.nodeValue );
	return ids;
}

/**
 * Search for elements wearing the specified tag
 * @param {String} tagname Tag to search
 * @returns {Array} array of node indexes
 */
damas.project.getNodesByTag = function ( tagname )
{
	damas.log.cmd( "damas.project.getNodesByTag", arguments );
	var query = "SELECT node.id FROM node LEFT JOIN tag ON node.id=tag.node_id WHERE tag.name='" + tagname + "' ORDER BY node.type;";
	return project.getNodesBySQL( query );
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
	//this.previous_id = elem.previous_id;
	//this.next_id = elem.next_id;
	this.keys = elem.keys;
	this.tags = elem.tags;
	this.single = elem.single;
	this.children = elem.children;
	this.links = elem.links;
	this.tagName = elem.tagName;
	this.extendme();
}

/**
 * Reads properties from an XML fragment
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 */
damas.element.readXML = function ( XMLElement )
{
	this.single = XMLElement;
	this.id = parseInt( XMLElement.getAttribute( 'id' ) );
	this.parent_id = parseInt( XMLElement.getAttribute( 'parent_id' ) );
	this.parent_id = ( isNaN( this.parent_id ) )? undefined : this.parent_id;  //parent_id is a number or undefined if root
	this.type = XMLElement.getAttribute('type');
	this.keys = new Hash();
	this.tags = new Array();
	this.childCount = XMLElement.getAttribute("childcount");
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

/**
 * Reads properties from an XML fragment
 * @private
 * @param {XMLElement} XMLElement XML fragment to read
 */
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
	damas.sort( this.children );
	damas.sort( this.links );
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
 * Asynchronously retrieves the children of the element according to its id.
 * @private
 */
/*
damas.element.getChildren = function ( callback )
{
	new Ajax.Request( project.server + "/model.soap.php", {
		parameters: { cmd: 'children', id: this.id },
		onSuccess: function( transport ) {
			var err = serverResponseHandle.notifyError( transport.responseXML );
			this.readChildrenXML( transport.responseXML );
			if( callback )
				callback();
			document.fire( 'damas:element.getchildren', this );
		}.bind(this)
	});
}
*/

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
 * Deletes the element
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
 * Remove a key on a node
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
 * Add a new key on a node. If an attribute with that name is already present in the element, its value is changed to be that of the value parameter. This value is a simple string; it is not parsed as it is being set. So any markup (such as syntax to be recognized as an entity reference) is treated as literal text, and needs to be appropriately escaped by the implementation when it is written out.
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
 * Remove a tag of the element.
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
 * Move the specified element to trashcan element ( id=dam:trashcan ) .
 * If trashcan is not found it is created under the root element.
 * @returns {Boolean} true on success, false otherwise
 */
damas.element.recycle = function ()
{
	damas.log.cmd( "that.recycle", arguments );
	var args = { cmd: "recycle", id: this.id };
	var res = damas.post( project.server + "/asset.soap.php", args ).bool;
	if( res ) document.fire( 'dam:element.recycled', this );
	return res;
}

/**
 * Insert a message on the element
 * @param {String} text text for the new message
 * @returns {Boolean} true on success, false otherwise
 */
damas.element.write = function ( text )
{
	damas.log.cmd( "that.write", arguments );
	var args = { cmd: "write", id: this.id, text: text };
	var res = damas.post( project.server + "/asset.soap.php", args ).bool;
	if( res ) document.fire( 'dam:element.updated', this );
	return res;
}

/**
 * Insert/update the time key of an element
 * @returns {Boolean} true on success, false otherwise
 */
damas.element.time = function ( )
{
	damas.log.cmd( "that.time", arguments );
	var args = { cmd: "time", id: this.id };
	var res = damas.post( project.server + "/asset.soap.php", args ).bool;
	if( res ) document.fire( 'dam:element.updated', this );
	return res;
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
