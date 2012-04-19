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
    elem = proj.searchKey( 'id', 'element_id')
    print elem

  Author:
    Remy Lalanne

  Contributors:
    Stephane Hoarau
    Sebastien Courtois
    Michael Haussmann

  ChangeLog:
    120131 added element.write method
    120119 added link and unlink methods
    120110 added getNodesBySQL()
    111202 fix: setKey value.encode('utf8') (thanks to sebastien courtois)
    111104 added recycle() method
    111014 fix: parent_id set to None if root element
    111003 new methods cloneNode() createFromTemplate() move() setKeys() setTags() 
    111003 element.id and element.parent_id are converted to integers

  Todo:
"""

import urllib # quote()
import urllib2
import cookielib
import xml.dom.minidom

class project :
	"""
		Static methods to interact with a remote DAMAS project
	"""
	def __init__ ( self, url) :
		self.cj = cookielib.LWPCookieJar()
		self.serverURL = url

	# AUTHENTICATION METHODS

	def signIn ( self, username, password ) :
		""" return True on success, False otherwise"""
		opener = urllib2.build_opener( urllib2.HTTPCookieProcessor(self.cj) )
		urllib2.install_opener( opener )
		try: a = urllib2.urlopen( self.serverURL + '/auth.soap.php?cmd=login&user=' + username + '&password=' + password )
		except: return False
		soap = xml.dom.minidom.parseString( a.read() )
		return soap.getElementsByTagName("error")[0].getAttribute("code") == "0"

	def getElementById ( self, id ) :
		return self.searchKey( 'id', id )[0]

	# MODEL METHODS

	def createNode ( self, id, tagName ) :
		data = "cmd=createNode&id=" + str(id) + "&type=" + tagName
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		return element( soap, self )

	def cloneNode ( self, id ) :
		data = "cmd=duplicate&id=" + str(id)
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		return element( soap, self )

	def createFromTemplate ( self, id, target, keys, tags ) :
		elem = self.cloneNode( id )
		elem.move( target )
		for k, v in keys.items() :
			elem.setKey( k, v )
			self.setKeys( elem.id, '{@' + k + '}', v )
		elem.setTags( tags )
		return elem

	def setKeys ( self, id, old_pattern, new_pattern ) :
		data = "cmd=setKeys&id=" + str(id) + "&old=" + urllib.quote( old_pattern ) + "&new=" + urllib.quote( new_pattern )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def setTags ( self, id, tags ) :
		data = "cmd=setTags&id=" + str(id) + "&tags=" + urllib.quote( tags )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def getNode ( self, id ) :
		data = "cmd=single&id=" + str( id )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		return element( soap, self )

	def getChildren ( self, id ) :
		data = "cmd=children&id=" + str( id )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		children = []
		for node in soap.getElementsByTagName("node") :
			children.append( element( node, self ) )
		return children

	def getNodes ( self, ids ) :
		data = "cmd=multi&depth=1&flags=4&id=" + ",".join( map( str, ids ) )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		elements = []
		for node in soap.getElementsByTagName("node") :
			elements.append( element( node, self ) )
		return elements

	def getNodesBySQL ( self, query ):
		'''
		Search for elements, specifying an SQL SELECT query.
		The SQL SELECT query must be formated to return results with an 'id' field, which contains elements indexes.
		@param {String} query SQL query to perform
		@returns {Array} array of element indexes
		'''
		data = "query=" + urllib.quote( query.encode('utf8') )
		a = urllib2.urlopen( self.serverURL + "/mysql.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		ids = []
		for id in soap.getElementsByTagName('id') :
			ids.append( id )
		return ids

	def link ( self, src_id, tgt_id ) :
		'''
		Make a directed link between 2 elements
		@param {Integer} src_id the source node internal id of the link
		@param {Integer} tgt_id the target node internal id of the link
		@returns the link id integer on success, False otherwise
		'''
		data = "cmd=link&src=" + str( src_id ) + "&tgt=" + str( tgt_id )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return int( soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue )
		except: return False

	def move ( self, id, target ) :
		data = "cmd=move&id=" + str( id ) + "&target=" + str( target )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def removeNode ( self, id ) :
		data = "cmd=removeNode&id=" + str(id)
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def setKey ( self, id, name, value ) :
		data = "cmd=setKey&id=" + str(id) + "&name=" + name + "&value=" + urllib.quote( value.encode('utf8') )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def searchKey ( self, keyname, keyvalue ) :
		data = "cmd=searchKey&key=" + keyname + "&value=" + urllib.quote( keyvalue )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		elements = []
		for node in soap.getElementsByTagName("node") :
			elements.append( element( node, self ) )
		return elements

	def unlink ( self, link_id ) :
		'''
		Remove a directed link between 2 elements
		@param {Integer} the link id to remove
		@returns True on success, False otherwise
		'''
		data = "cmd=unlink&id=" + str( link_id )
		a = urllib2.urlopen( self.serverURL + "/model.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	# FILE METHODS

	def lock ( self, id, comment ) :
		data = "cmd=lock&id=" + str(id) + "&comment=" + urllib.quote( comment )
		a = urllib2.urlopen( self.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def unlock ( self, id ) :
		data = "cmd=unlock&id=" + str(id)
		a = urllib2.urlopen( self.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	def backup ( self, id ) :
		"""Copy the asset to backupdir and make a new version element"""
		data = "cmd=version_backup&id=" + str( id )
		a = urllib2.urlopen( self.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		return element( soap, self )

	def increment ( self, id, message ) :
		"""Increment the asset after a successful commit"""
		data = "cmd=version_increment&id=" + str(id) + "&message=" + urllib.quote( message )
		a = urllib2.urlopen( self.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False

	# DAM METHODS
	def recycle ( self, id ) :
		data = "cmd=recycle&id=" + str(id)
		a = urllib2.urlopen( self.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False


class element ( object ) :
	"""This class defines elements in a DAMAS project"""

	def __init__ ( self, XMLElement, project ) :
		self.children = []
		self.id = None
		self.keys = {}
		self.parent_id = None
		self.project = project
		self.tags = []
		self.type = None
		self.readXML( XMLElement )

	def __repr__ ( self ) :
		txt  = "id= " + str( self.id )
		txt += "\ntype= " + self.type
		txt += "\nparent_id= " + str( self.parent_id )
		txt += "\nkeys= " + str( self.keys )
		txt += "\ntags= " + str( self.tags )
		txt += "\nchildren= " + str( self.children )
		return txt

	def readXML ( self, XMLElement ) :
		if not hasattr( XMLElement, 'tagName' ) :
			XMLElement = XMLElement.getElementsByTagName("node")[0]
		if XMLElement.tagName != "node" :
			XMLElement = XMLElement.getElementsByTagName("node")[0]
		self.id = int( XMLElement.getAttribute( "id" ) )
		self.type = XMLElement.getAttribute( "type" )
		self.parent_id = int( XMLElement.getAttribute( "parent_id" ) ) if XMLElement.getAttribute( "parent_id" ) else None
		keys = XMLElement.getElementsByTagName("key")
		for k in keys:
			if k.firstChild:
				self.keys[ k.getAttribute('name') ] = k.firstChild.nodeValue
			else:
				self.keys[ k.getAttribute('name') ] = ""
		tags = XMLElement.getElementsByTagName("tag")
		for t in tags:
			self.tags.append( t.firstChild.nodeValue )


	def createNode ( self, type ) :
		return self.project.createNode( self.id, type )

	def getChildren ( self ) :
		self.children = self.project.getChildren( self.id )
		return self.children

	def move ( self, target ) :
		if self.project.move( self.id, target ):
			self.parent_id = target
			return True
		return False

	def setKey ( self, name, value ) :
		# stephane update
		if self.project.setKey( self.id, name, value ):
			self.keys[name] = value
			return True
		return False
		#return self.project.setKey( self.id, name, value )

	def setTags ( self, tags ) :
		return self.project.setTags( self.id, tags )

	def lock ( self, text ) :
		return self.project.lock( self.id, text )

	def unlock ( self ) :
		return self.project.unlock( self.id )

	def backup ( self ) :
		"""Copy the asset to backupdir and make a new asset version. To run before overwriting the file"""
		return self.project.backup( self.id )

	def increment ( self, message ) :
		"""Increment the asset. To run after a successful file overwrite"""
		return self.project.increment( self.id, message )

	def recycle ( self ) :
		return self.project.recycle( self.id )

	def write ( self, text ) :
		'''
		Insert a message on the element
		@param {String} text text for the new message
		@returns {Boolean} true on success, false otherwise
		'''
		data = "cmd=write&id=" + str( self.id ) + "&text=" +  urllib.quote( text.encode('utf8') )
		a = urllib2.urlopen( self.project.serverURL + "/asset.soap.php?" + data )
		soap = xml.dom.minidom.parseString( a.read() )
		try: return soap.getElementsByTagName("returnvalue")[0].firstChild.nodeValue == "1"
		except: return False
