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
    project = damas.http_connection( "https://localhost/api" )
    elem = project.search('id:element_id')
    print elem
"""

import json
import requests
import urllib

#requests.packages.urllib3.disable_warnings() # remove certificate warning

class http_connection( object ) :
	__sep = '<sep>'

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
		Create a node wearing the specified keys
		@param {Hash} keys of the new node
		@returns {Hash} New node on success, false otherwise
		'''
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.post(self.serverURL+"/create/", data=json.dumps(keys),
			headers=headers, verify=False)
		if r.status_code == 201 or r.status_code == 207:
			return json.loads(r.text)
		return None

	def read( self, id_ ) :
		'''
		Retrieve a node specifying its internal node index
		@param {String} id_ the internal node index to search
		@returns {Hash} node or false on failure
		'''
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.post(self.serverURL+"/read/", data=json.dumps(id_),
			headers=headers, verify=False)
		if r.status_code == 200 or r.status_code == 207:
			return json.loads(r.text)
		return None

	def update( self, id_, keys ) :
		'''
		Modify a node(s). If an attribute with that name is already present in
		the element, its value is changed to be that of the value parameter.
		Specifying a None value for a key will remove the key from the node
		@param {String} id_ Element index
		@param {Hash} keys to add and remove
		@returns {Hash} updated node or false on failure
		'''
		if isinstance(id_, (tuple,list,set)):
			id_ = __sep.join(id_)
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.put(self.serverURL+'/update/'+urllib.quote(id_, safe=''),
			data=json.dumps(keys), headers=headers, verify=False)
		if r.status_code == 200 or r.status_code == 207:
			return json.loads(r.text)
		return None

	def delete( self, id_ ) :
		'''
		Delete a node
		@param {String} id_ the internal node index to delete
		@returns {Boolean} True on success, False otherwise
		'''
		if isinstance(id_, (tuple,list,set)):
			id_ = __sep.join(id_)
		r = requests.delete(self.serverURL+'/delete/'+urllib.quote(id_, safe=''),
			headers=self.headers, verify=False)
		if r.status_code == 200 or r.status_code == 207:
			return json.loads(r.text)
		return None

	def search( self, query ) :
		'''
		Find elements wearing the specified key(s)
		@param {String} query string
		@returns {Array} array of element indexes or None if no element found
		'''
		r = requests.get(self.serverURL+'/search/'+urllib.quote(query, safe=''),
			headers=self.headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def search_one( self, query ) :
		'''
		Find nodes wearing the specified key(s) and return the first occurence
		@param {String} query string
		@returns {Array} array of element indexes or None if no element found
		'''
		r = requests.get(self.serverURL+'/search_one/'+
			urllib.quote(query, safe=''), headers=self.headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def search_mongo( self, query, sort, limit, skip ) :
		data = {"query":query, "sort":sort, "limit":limit, "skip":skip}
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.post(self.serverURL+'/search_mongo', data=json.dumps(data),
			headers=headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None

	def graph( self, id_ ) :
		'''
		Retrieve a node graph specifying its index
		@param {String} id_ the node index(es) to search
		@returns {Hash} node or false on failure
		'''
		if isinstance(id_, (tuple,list,set)):
			id_ = __sep.join(id_)
		r = requests.get(self.serverURL+'/graph/'+urllib.quote(id_, safe=''),
			headers=self.headers, verify=False)
		if r.status_code == 200 or r.status_code == 207:
			return json.loads(r.text)
		return None

	def lock( self, id_ ) :
		'''
		Lock an asset for edition
		@param {String} id_ the internal node index
		@returns {Boolean} True on success, False otherwise
		'''
		r = requests.put(self.serverURL+'/lock/'+urllib.quote(id_, safe=''),
			headers=self.headers, verify=False)
		return r.status_code == 200

	def unlock( self, id_ ) :
		'''
		Unlock a locked asset
		@param {String} id_ the internal node index
		@returns {Boolean} True on success, False otherwise
		'''
		r = requests.put(self.serverURL+'/unlock/'+urllib.quote(id_, safe=''),
			headers=self.headers, verify=False)
		return r.status_code == 200

	def version( self, id_, keys ) :
		'''
		Create a node version
		@param {Hash} keys of the new node
		@returns {Hash} New node on success, false otherwise
		'''
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.post('%s/version/%s' % (self.serverURL, id_),
			data=json.dumps(keys), headers=headers, verify=False)
		if r.status_code == 201:
			return json.loads(r.text)
		return None

	""" commented until proper implementation
	def link( self, target, sources, keys ) :
		'''
		Create a node edge from sources to target wearing the specified keys
		@param {Hash} keys of the new node
		@returns {Hash} Array of created edges ids on success, None otherwise
		'''
		data = {"target":target, "sources":sources, "keys":keys}
		headers = {'Content-Type': 'application/json'}
		headers.update(self.headers)
		r = requests.post('%s/link' % (self.serverURL), data=json.dumps(data), headers=headers, verify=False)
		if r.status_code == 200:
			return json.loads(r.text)
		return None
	"""


	# USERS AUTHENTICATION METHODS
 
	def signIn( self, username, password ) :
		'''
		@return {Boolean} True on success, False otherwise
		'''
		r = requests.post(self.serverURL+'/signIn', data={"username":username,
			"password":password}, verify=False)
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
		r = requests.get(self.serverURL+'/verify', headers=self.headers,
			verify=False )
		if r.status_code == 200:
			return True
		return False
