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
    import damas_client
    project = damas.http_connection( "https://localhost" )
    elem = project.search('id:element_id')
    print elem
"""

import json
import requests

#requests.packages.urllib3.disable_warnings() # remove certificate warning

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
        Create a node wearing the specified keys
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.post(self.serverURL+"/api/create/", data=json.dumps(keys),
            headers=headers, verify=False)
        if r.status_code == 201 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def read( self, id_ ) :
        '''
        Retrieve a node specifying its internal node index
        @param {String} id_ the internal node index to search
        @returns {Hash} node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.post(self.serverURL+"/api/read/", data=json.dumps(id_),
            headers=headers, verify=False)
        if r.status_code == 200 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def update( self, keys ) :
        '''
        Modify a node(s). Specifying a None value for a key will
        remove the key from the node.
        @param {Hash} keys of the node to update
        @returns {Hash} updated node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.put(self.serverURL+'/api/update/', data=json.dumps(keys),
            headers=headers, verify=False)
        if r.status_code == 200 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def upsert( self, keys ) :
        '''
        Create a node wearing the specified keys or update an already
        existing node if id is specified and found
        @param {Hash} keys of the new node or updated node
        @returns {Hash} New nodes and updated nodes on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.post(self.serverURL+'/api/upsert/', data=json.dumps(keys),
                headers=headers, verify=False)
        if r.status_code == 200 or r.status_code == 201:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def delete( self, id_ ) :
        '''
        Delete a node
        @param {String} id_ the internal node index to delete
        @returns {Boolean} True on success, False otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.delete(self.serverURL+'/api/delete/', data=json.dumps(id_),
            headers=headers, verify=False)
        if r.status_code == 200 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def search( self, query ) :
        '''
        Find elements wearing the specified key(s)
        @param {String} query string
        @returns {Array} array of element indexes or None if no element found
        '''
        r = requests.get(self.serverURL+'/api/search/'+query,
            headers=self.headers, verify=False)
        if r.status_code == 200:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def search_one( self, query ) :
        '''
        Find nodes wearing the specified key(s) and return the first occurence
        @param {String} query string
        @returns {Array} array of element indexes or None if no element found
        '''
        r = requests.get(self.serverURL+'/api/search_one/'+query,
        headers=self.headers, verify=False)
        if r.status_code == 200:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    def search_mongo( self, query, sort, limit, skip ) :
        '''
		Find elements using a MongoDB query object (if MongoDB is the back-end)
		@param {Object} https://docs.mongodb.org/v3.0/reference/method/db.collection.find/
		@param {Object} https://docs.mongodb.org/v3.0/reference/method/cursor.sort/
		@param {Number} https://docs.mongodb.org/v3.0/reference/method/cursor.limit/
		@param {Number} https://docs.mongodb.org/v3.0/reference/method/cursor.skip/
        '''
        data = {"query":query, "sort":sort, "limit":limit, "skip":skip}
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.post(self.serverURL+'/api/search_mongo/',
            data=json.dumps(data), headers=headers, verify=False)
        if r.status_code == 200:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)


    def graph( self, id_ ) :
        '''
        Retrieve a node graph specifying its index
        @param {String} id_ the node index(es) to search
        @returns {Hash} node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        r = requests.post(self.serverURL+'/api/graph/0/', data=json.dumps(id_),
            headers=headers, verify=False)
        if r.status_code == 200 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)


    # USERS AUTHENTICATION METHODS

    def signIn( self, username, password ) :
        '''
        @return {Boolean} True on success, False otherwise
        '''
        r = requests.post(self.serverURL+'/api/signIn/', data={"username":username, "password":password}, verify=False)
        if r.status_code == 200:
            self.token = json.loads(r.text)
            self.headers['Authorization'] = 'Bearer ' + self.token['token']
            return (r.status_code, True)
        return (r.status_code, False)

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
        r = requests.get(self.serverURL+'/api/verify/', headers=self.headers, verify=False )
        if r.status_code == 200:
            return (r.status_code, True)
        return (r.status_code, False)


