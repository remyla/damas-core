"""
  Python methods and objects for DAMAS software (damas-software.org)

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
    project = damas.http_connection( "https://example.com/damas/server" )
    elem = project.search('id:element_id')
    print elem
"""

import json
import requests

class http_connection( object ) :
	'''
	Methods to interact with a remote DAMAS server using HTTP
	'''
	def __init__( self, url ) :
		#self.cj = cookielib.LWPCookieJar()
		self.serverURL = url
		self.token = None
		self.headers = {}

	def create( self, keys ) :
		'''
		Create a node
		@param {Hash} keys of the new node
		@returns {Hash} New node on success, false otherwise
		'''
		headers = {'content-type': 'application/json'}
		headers.update(self.headers)
		r = requests.post(self.serverURL, data=json.dumps(keys), headers=headers, verify=False)
		if r.status_code == 201:
			return json.loads(r.text)
		return None

	def read( self, id_ ) :
		'''
		Retrieve a node specifying its internal node index
		@param {String} id_ the internal node index to search
		@returns {Hash} node or false on failure
		'''
		r = requests.get(self.serverURL+'/'+id_, headers=self.headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def update( self, id_, keys ) :
		'''
		Modify a node. If an attribute with that name is already present in
		the element, its value is changed to be that of the value parameter.
		Specifying a None value for a key will remove the key from the node
		@param {String} id_ Element index
		@param {Hash} keys to add and remove
		@returns {Hash} updated node or false on failure
		'''
		headers = {'content-type': 'application/json'}
		headers.update(self.headers)
		r = requests.put(self.serverURL+'/'+id_, data=json.dumps(keys), headers=headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def delete( self, id_ ) :
		'''
		Delete a node
		@param {String} id_ the internal node index to delete
		@returns {Boolean} True on success, False otherwise
		'''
		r = requests.delete(self.serverURL+'/'+id_, headers=self.headers, verify=False)
		return r.status_code == 200

	def search( self, query ) :
		'''
		Find elements wearing the specified key(s)
		@param {String} query string
		@returns {Array} array of element indexes or None if no element found
		'''
		r = requests.get(self.serverURL+'/search/'+query, headers=self.headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def graph( self, id_ ) :
		'''
		Retrieve a node graph specifying its index
		@param {String} id_ the node index(es) to search
		@returns {Hash} node or false on failure
		'''
		r = requests.get(self.serverURL+'/graph/'+id_, headers=self.headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def lock( self, id_ ) :
		'''
		Lock an asset for edition
		@param {String} id_ the internal node index
		@returns {Boolean} True on success, False otherwise
		'''
		r = requests.put(self.serverURL+'/lock/'+id_, headers=self.headers, verify=False)
		return r.status_code == 200

	def unlock( self, id_ ) :
		'''
		Unlock a locked asset
		@param {String} id_ the internal node index
		@returns {Boolean} True on success, False otherwise
		'''
		r = requests.put(self.serverURL+'/unlock/'+id_, headers=self.headers, verify=False)
		return r.status_code == 200

	# USERS AUTHENTICATION METHODS
 
	def signIn( self, username, password ) :
		'''
		@return {Boolean} True on success, False otherwise
		'''
		r = requests.post(self.serverURL+'/signIn', data={"username":username, "password":password}, verify=False)
		if r.status_code == 200:
			self.token = json.loads(r.text)
			self.headers['Authorization'] = 'Bearer ' + self.token['token']
			return True
		return False
		# opener = urllib2.build_opener( urllib2.HTTPCookieProcessor( self.cj ) )
		# urllib2.install_opener( opener )
		# try: a = urllib2.urlopen( self.serverURL + '/authentication.php?cmd=login&user=' + username + '&password=' + password )
		# except: return False
		# return json.loads( a.read() )
 
	def signOut( self ) :
		'''
		@return {Boolean} True on success, False otherwise
		'''
		self.token =  None
		del self.headers['Authorization']
 
	def verify( self ) :
		'''
		@return {dict} a dictionary containing username and userclass on success, None otherwise
		'''
		r = requests.get(self.serverURL+'/verify', headers=self.headers, verify=False )
		if r.status_code == 200:
			return True
		return False
