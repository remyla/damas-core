"""
  Python methods and objects for DAMAS software (damas-software.org)

  Copyright 2011,2012 Remy Lalanne

  This file is part of damas-core.

  damas-core is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  damas-core is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with damas-core.  If not, see <http://www.gnu.org/licenses/>.

  Usage:
    import damas
    proj = damas.project( "https://example.com/damas/server" )
    if proj.signIn( "login", "password" ):
      print "authentication succeeded"
      # ... code here ...
    else:
      print "authentication failed"

  Usage: retrieve an element
    elem = proj.find({'id': 'element_id'})
    print elem

  Author:
    Remy Lalanne

  Contributors:
    Stephane Hoarau
    Sebastien Courtois
    Michael Haussmann

  ChangeLog:
    130319 removed use of reserved words: type and id, fixed issues on links
           (thanks stephane hoarau)
    130108 id and parent_id forced to int
    121116 added element.filecheck method
    121113 reflected lock / unlock methods api changes
    121112 some code cleanup (thanks Stephane Hoarau)
    120924 renamed dam.getChildren in dam.children
           added dam.find
           dam.getElementsBySQL replaced by dam.findSQL
           removed dam.getElementById method
           soap is replaced by json
           xml.dom module import removed
    120503 user authentication now use json
    120131 added element.write method
    120119 added link and unlink methods
    120110 added getNodesBySQL()
    111202 fix: setKey value.encode('utf8') (thanks to sebastien courtois)
    111104 added recycle() method
    111014 fix: parent_id set to None if root element
    111003 new methods cloneNode() createFromTemplate() move() setKeys()
           setTags()
    111003 element.id and element.parent_id are converted to integers

  Todo:
"""

import urllib
import urllib2
import cookielib
import json

class project( object ) :
	'''
	Static methods to interact with a remote DAMAS project
	'''
	def __init__( self, url ) :
		self.cj = cookielib.LWPCookieJar()
		self.serverURL = url

	# AUTHENTICATION METHODS

	def signIn( self, username, password ) :
		'''
		@return {Boolean} True on success, False otherwise
		'''
		opener = urllib2.build_opener( urllib2.HTTPCookieProcessor( self.cj ) )
		urllib2.install_opener( opener )
		try: a = urllib2.urlopen( self.serverURL + '/authentication.php?cmd=login&user=' + username + '&password=' + password )
		except: return False
		return json.loads( a.read() )

	def signOut( self ) :
		'''
		@return {Boolean} True on success, False otherwise
		'''
		return self.command( { 'cmd': 'logout' }, '/authentication.php' )['status'] == 401

	def getUser( self ) :
		'''
		@return {dict} a dictionary containing username and userclass on success, None otherwise
		'''
		return self.command( { 'cmd': 'getUser' }, '/authentication.php' )['json']


	# MODEL METHODS

	def ancestors( self, idx ) :
		'''
		Retrieve the ancestors (parent and above) of a node
		@param {Integer} id node index
		@return {list} list of ancestors ids
		'''
		return self.readJSONElements( self.command( { 'cmd': 'ancestors', 'id': idx } )['json'] )

	def children( self, idx ) :
		'''
		Retrieve the children of a node
		@param {Integer} id node index
		@return {list} list of children elements
		'''
		return self.readJSONElements( self.command( { 'cmd': 'children', 'id': idx } )['json'] )

	def cloneNode( self, idx ) :
		'''
		Make an exact copy of an element
		@param {Integer} id Element Index
		@returns {Element} element created on success, False otherwise
		'''
		res = self.command( { 'cmd': 'duplicate', 'id': idx } )
		if res['status'] == 200:
			return element( res['json'], self )
		return False

	def command( self, args, server = "/model.json.php" ) :
		'''
		Send a command to the web service
		@param {dict} args the arguments of he command to send
		@param {string} server the URL of the web service
		@returns {dict} a dictionary containing the returned code, text, and json
		'''
		req = urllib2.Request( self.serverURL + server, urllib.urlencode( args ) )
		try:
			a = urllib2.urlopen( req )
		except urllib2.HTTPError, error:
			return { 'status': error.code, 'text': error.read(), 'json': None }
		except urllib2.URLError, error:
			print 'Could not connect to server'
			print error.reason
			return { 'status': False, 'text': None, 'json': None }
		responseText = a.read()
		try:
			return { 'status': a.code, 'text': responseText, 'json': json.loads( responseText ) }
		except:
			return { 'status': a.code, 'text': responseText, 'json': None }

	def createFromTemplate( self, idx, target, keys, tags ) :
		'''
		Creates a node using an existing node as template.
		@param {Integer} id Template node index
		@param {Integer} target Parent node index
		@param {Hash} keys Hash of key/value pairs
		@param {String} tags Comma separated tags string
		@returns {Element} the new element
		'''
		elem = self.cloneNode( idx )
		elem.move( target )
		for k, v in keys.items() :
			elem.setKey( k, v )
			self.setKeys( elem.id, '{@' + k + '}', v )
		elem.setTags( tags )
		return elem

	def createNode( self, idx, nodeType ) :
		'''
		Creates a node of the specified type
		@param {Integer} id Parent node index
		@param {String} nodeType type of the new node
		@returns {DamNode} New node on success, false otherwise
		'''
		res = self.command( { 'cmd': 'createNode', 'id': idx, 'type': nodeType } )
		if res['status'] == 200:
			return element( res['json'], self )
		return False

	def find( self, keys ) :
		'''
		Find elements wearing the specified key(s)
		@param {dict} keys dictionary of key/value pairs to match
		@returns {list} list of elements indexes found
		'''
		keys['cmd'] = 'find'
		return json.loads( self.command( keys )['text'] )

	def findSQL( self, query ):
		'''
		Search for elements, specifying an SQL SELECT query.
		The SQL SELECT query must be formated to return results with an 'id' field, which contains elements indexes.
		@param {String} query SQL query to perform
		@returns {Array} array of element indexes
		'''
		return self.command( { 'cmd': 'findSQL', 'query': query } )['json']

	def getNode( self, idx ) :
		'''
		Retrieve a Damas element specifying its internal node index
		@param {Integer} id the internal node index to search
		@returns {Damas Element} DAMAS element or false on failure
		'''
		res = self.command( { 'cmd': 'single', 'id': idx } )
		if res['status'] == 200:
			return element( res['json'], self )
		return False

	def getNodes( self, ids ) :
		'''
		Retrieve DAMAS elements specifying their internal node indexes
		@param {Array} indexes array of node ids to retrieve
		@returns {Array} array of Damas elements
		'''
		return self.readJSONElements( self.command( { 'cmd': 'multi', 'id': ','.join( str( idx ) for idx in ids ) } )['json'] )

	def link( self, src_id, tgt_id ) :
		'''
		Make a directed link between 2 elements
		@param {Integer} src_id the source node internal id of the link
		@param {Integer} tgt_id the target node internal id of the link
		@returns the link id integer on success, False otherwise
		'''
		sResult = self.command( { 'cmd': 'link', 'src': src_id, 'tgt': tgt_id } )['text']
		if sResult:
			return int( sResult )
		return False

	def links( self, idx ) :
		'''
		Retrieve the elements linked to the specified element
		@param {Array} indexes array of node ids to retrieve
		@returns {Array} array of Damas elements
		'''
		return self.readJSONElements( self.command( { 'cmd': 'links', 'id': idx } )['json'] )

	def move( self, idx, target ) :
		'''
		Move elements
		@param {Integer} id Element index
		@param {Integer} target Index of the new parent element
		@returns {Boolean} true on success, false otherwise
		'''
		return self.command( { 'cmd': 'move', 'id': idx, 'target': target } )['status'] == 200

	def readJSONElements( self, json ) :
		'''
		Deserialize JSON objects to Damas elements
		@param {Object} obj json object to read
		@return list of deserialized elements
		'''
		elements = []
		for e in json:
			elements.append( element( e, self ) )
		return elements

	def removeNode( self, idx ) :
		'''
		Recursively delete the specified node
		@param {Integer} id Element index to delete
		@returns {Boolean} True on success, False otherwise
		'''
		return self.command( { 'cmd': 'removeNode', 'id': idx } )['status'] == 200

	def setKey( self, idx, name, value ) :
		'''
		Adds a new attribute. If an attribute with that name is already present in
		the element, its value is changed to be that of the value parameter
		@param {Integer} id Element index
		@param {String} name Name of the attribute
		@param {String} value Value of the attribute
		@returns {Boolean} True on success, False otherwise

		'''
		return self.command( { 'cmd': 'setKey', 'id': idx, 'name': name, 'value': value } )['status'] == 200

	def setKeys( self, idx, old_pattern, new_pattern ) :
		'''
		Recursively modify a node, searching and replacing a specified pattern in its sub key values
		@param {Integer} id Node index to modify
		@param {String} old_pattern Name of the attribute
		@param {String} value Value of the attribute
		@returns {Boolean} True on success, False otherwise
		'''
		return self.command( { 'cmd': 'setKeys', 'id': idx, 'old': old_pattern, 'new': new_pattern } )['status'] == 200

	def setTags( self, idx, tags ) :
		'''
		Set multiple tags at a time on the specified element
		@param {String} tags The coma separated tags to set
		@returns {Boolean} True on success, False otherwise
		'''
		return self.command( { 'cmd': 'setTags', 'id': idx, 'tags': tags } )['status'] == 200

	def unlink( self, link_id ) :
		'''
		Remove a directed link between 2 elements
		@param {Integer} the link id to remove
		@returns True on success, False otherwise
		'''
		return self.command( { 'cmd': 'unlink', 'id': link_id } )['status'] == 200


class element( object ) :
	"""This class defines elements in a DAMAS project"""

	def __init__( self, json, project ) :
		self.childcount = None
		self.children = []
		self.id = None
		self.keys = {}
		self.parent_id = None
		self.project = project
		self.tags = []
		self.type = None
		self.link_id = None

		if json:
			self.childcount = json['childcount']
			self.id = int( json['id'] )
			if 'keys' in json:
				self.keys = json['keys']
			if json['parent_id']:
				self.parent_id = int( json['parent_id'] )
			if 'tags' in json:
				self.tags = json['tags']
			self.type = json['type']
			if 'link_id' in json:
				self.link_id = int( json['link_id'] )

	def __repr__( self ) :
		txt = "id= " + str( self.id )
		txt += "\ntype= " + str( self.type )
		txt += "\nparent_id= " + str( self.parent_id )
		txt += "\nkeys= " + str( self.keys )
		txt += "\ntags= " + str( self.tags )
		txt += "\nchildren= " + str( self.children )
		txt += "\nlink_id= " + str( self.links )
		return txt

	def createNode( self, nodeType ) :
		return self.project.createNode( self.id, nodeType )

	def getChildren( self ) :
		self.children = self.project.children( self.id )
		return self.children

	def move( self, target ) :
		if self.project.move( self.id, target ):
			self.parent_id = target
			return True
		return False

	def setKey( self, name, value ) :
		if self.project.setKey( self.id, name, value ):
			self.keys[name] = value
			return True
		return False

	def setTags( self, tags ) :
		return self.project.setTags( self.id, tags )


	# FILE METHODS

	def lock( self ) :
		return self.project.command(
				{ 'cmd': 'lock', 'id': self.id },
				'/asset.json.php' )['status'] == 200

	def unlock( self ) :
		return self.project.command(
				{ 'cmd': 'unlock', 'id': self.id },
				'/asset.json.php' )['status'] == 200

	def backup( self ) :
		"""Copy the asset to backupdir and make a new asset version. To run before overwriting the file"""
		return element( self.project.command( { 'cmd': 'version_backup', 'id': self.id }, '/asset.json.php' )['json'], self.project )

	def increment( self, message ) :
		"""Increment the asset. To run after a successful file overwrite"""
		return self.project.command(
				{ 'cmd': 'version_increment', 'id': self.id, 'message': message },
				'/asset.json.php' )['status'] == 200

	def filecheck( self ) :
		"""
		200 = check is ok
		404 = file not found
		403 = file read only
		"""
		return self.project.command(
				{ 'cmd': 'filecheck', 'id': self.id },
				'/asset.json.php' )['status'];

	# DAM METHODS

	def recycle( self ) :
		return self.project.command( { 'cmd': 'recycle', 'id': self.id }, '/asset.json.php' )['status'] == 200

	def write( self, text ) :
		'''
		Insert a message on the element
		@param {String} text text for the new message
		@returns {Boolean} true on success, false otherwise
		'''
		return self.project.command(
			{ 'cmd': 'write', 'id': id, 'text': text },
			'/asset.json.php' )['status'] == 200
