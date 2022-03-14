import aiohttp
import json
from re import search

class http_connection( object ) :
    '''
    Methods to interact with a remote DAMAS server using HTTP
    '''
    def __init__( self, url ) :
        #self.cj = cookielib.LWPCookieJar()
        self.serverURL = url
        self.token = None
        self.headers = {}
        self.connector = aiohttp.TCPConnector(verify_ssl=False)
    
    async def create( self, keys, callback) :
        '''
        Create a node wearing the specified keys
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            async with session.post(self.serverURL+"/api/create/", params = json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def read( self, id_, callback) :
        '''
        Retrieve a node specifying its internal node index
        @param {String} id_ the internal node index to search
        @returns {Hash} node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+"/api/read/", params = json.dumps(id_)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def update( self, keys, callback) :
        '''
        Modify a node(s). Specifying a None value for a key will
        remove the key from the node.
        @param {Hash} keys of the node to update
        @returns {Hash} updated node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/update/', params = json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def upsert( self, keys, callback) :
        '''
        Create a node wearing the specified keys or update an already
        existing node if id is specified and found
        @param {Hash} keys of the new node or updated node
        @returns {Hash} New nodes and updated nodes on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/upsert/', params = json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def delete( self, id_, callback) :
        '''
        Delete a node
        @param {String} id_ the internal node index to delete
        @returns {Boolean} True on success, False otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/delete/', params = json.dumps(id_)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def search( self, query, callback) :
        '''
        Find elements wearing the specified key(s)
        @param {String} query string
        @returns {Array} array of element indexes or None if no element found
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.get(self.serverURL+'/api/search/'+query) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)        

    async def search_one( self, query, callback) :
        '''
        Find nodes wearing the specified key(s) and return the first occurence
        @param {String} query string
        @returns {Array} array of element indexes or None if no element found
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.get(self.serverURL+'/api/search_one/'+query) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)        

    async def search_mongo( self, query, sort, limit, skip, callback) :
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            data = {"query":query, "sort":sort, "limit":limit, "skip":skip}
            async with session.post(self.serverURL+'/api/search_mongo/', params=json.dumps(data)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)       

    async def graph( self, id_, callback) :
        '''
        Retrieve a node graph specifying its index
        @param {String} id_ the node index(es) to search
        @returns {Hash} node or false on failure
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/graph/0/', params=json.dumps(id_)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)              

    # USERS AUTHENTICATION METHODS

    async def signIn( self, username, password, callback):
        '''
        @return {Boolean} True on success, False otherwise
        '''
        def req_callback(r):
            if r.status_code == 200:
                self.token = json.loads(r.text)
                self.headers['Authorization'] = 'Bearer ' + self.token['token']
                return (r.status_code, True)
            return (r.status_code, False)

        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers=headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/signIn/', params={"username":username, "password":password}) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        if not callback:
            return req_callback(r)     
        return callback(r)

    def signOut( self, callback) :
        '''
        @return {Boolean} True on success, False otherwise
        '''
        self.token =  None
        del self.headers['Authorization']
        if callback:
            return callback()

    async def verify(self, callback=None) :
        '''
        @return {dict} a dictionary containing username and userclass on success, None otherwise
        '''
        async with aiohttp.ClientSession(headers=self.headers, connector = self.connector) as session:
            async with session.get(self.serverURL+'/api/verify/') as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        if callback:
            return callback(r != None)
        else:
            return r != None

    async def lock( self, id_,callback) :
        '''
        Lock an asset for edition
        @param {String} id_ the internal node index
        @returns {Boolean} True on success, False otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            async with session.put(self.serverURL+'/api/lock/', params=json.dumps(id_)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        if callback:
            return callback(r != None)
        else:
            return r != None

    async def publish( self, keys, callback) :
        '''
        Publish an asset node wearing the specified keys. The keys _id, comment,
        origin must be specified. _id must be a string starting with '/'
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            async with session.post(self.serverURL+'/api/publish/', params=json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def unlock( self, id_, callback) :
        '''
        Unlock a locked asset
        @param {String} id_ the internal node index
        @returns {Boolean} True on success, False otherwise
        '''
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            async with session.put(self.serverURL+'/api/unlock/', params=json.dumps(id_)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        if callback:
            return callback(r != None)
        else:
            return r != None

    async def version( self, id_, keys, callback) :
        '''
        Create a node version
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            async with session.post('%s/api/version/%s' % (self.serverURL, id_), params=json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)

    async def comment(self, keys, callback) :
        '''
        Create a node with the specified keys (similar to create
        but concerns child node with parent's id as key)
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        async with aiohttp.ClientSession(headers = headers, connector = self.connector) as session:
            async with session.post(self.serverURL+"/api/comment/", params=json.dumps(keys)) as resp:
                r={"status_code":resp.status}
                res = await resp.json()
                r["data"] = res
        return callback(r)



