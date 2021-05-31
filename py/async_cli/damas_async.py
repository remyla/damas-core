import json

import aiohttp
import asyncio
import requests

from py.async_cli.DamasException import EmptyKeyElementException, NoneResultExecption, ClosedSessionExecption, \
    SessionNotInitializedExecption


class http_async_connection(object):
    def __init__(self, url, loop=asyncio.get_event_loop()):
        # self.cj = cookielib.LWPCookieJar()
        self.loop = loop
        self.serverURL = url
        # self.session = None
        self.session = aiohttp.ClientSession(loop=self.loop)
        self.response = None
        self.token = None
        self.headers = {}

    async def connect(self, callback=None):
        # async with aiohttp.ClientSession(loop=self.loop) as session:
        async with self.session as session:
            # self.session = session
            async with session.get(self.serverURL, ssl=False) as response:
                assert response.status == 200
                # print("Status:", response.status)
                self.headers = response.headers
                # print("Content-type:", self.headers['content-type'])
                html = await response.text()
                print("Body", html)
                print("-------------------------------- HTTP ",
                      self.serverURL,
                      "CONNECTION OK --------------------------------"
                      )
                print("==============================================================================================")
                print("==============================================================================================")
                print("|| RESPONSE SERVER = {} ||".format(response))
                print("==============================================================================================")
                print("==============================================================================================")
                self.response = response
                if callback is None:
                    print("there is no call back provided")
                    return self.response
                else:
                    res_callback = callback(self.response)
                    print("the call back is executed")
                    if res_callback is None:
                        print("the call back return none. return value before callback is {}".format(self.response))
                        return self.response
                    return res_callback

    # async def connect(self, callback=None):
    #     self.session = aiohttp.ClientSession(loop=self.loop)
    #     async with self.session.get(self.serverURL, ssl=False) as response:
    #         assert response.status == 200
    #         # print("Status:", response.status)
    #         self.headers = response.headers
    #         # print("Content-type:", self.headers['content-type'])
    #         html = await response.text()
    #         print("Body", html)
    #         print("-------------------------------- HTTP ",
    #               self.serverURL,
    #               "CONNECTION OK --------------------------------"
    #               )
    #         print("==============================================================================================")
    #         print("==============================================================================================")
    #         print("|| RESPONSE SERVER = {} ||".format(response))
    #         print("==============================================================================================")
    #         print("==============================================================================================")
    #         self.response = response
    #         print(response)
    #         if callback is None:
    #             print("there is no call back provided")
    #             return self.response
    #         else:
    #             print("the call back is executed")
    #             return callback

    async def disconnect(self):
        await self.session.close()

    def set_new_session(self, loop):
        self.session = aiohttp.ClientSession(loop=loop)

    async def create(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys is not None)
        except EmptyKeyElementException:
            EmptyKeyElementException(keys).throw("empty json keys element")
        async with self.session as session:
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/create/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(keys)
            print("type of keys = {}".format(type(keys)))
            print("type of data = {}".format(type(data)))
            print(data)
            async with session.post(url, data=data, headers=headers, ssl=False) as resp:
                assert resp is not None
                print("request response is {}".format(resp))
                json_result = await resp.json()
                print("json requests result ==============================================={}".format(json_result))
                if resp.status < 300:
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create returun None")
                    if callback is None:
                        print("there is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("callbck given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    print("Les erreurs du client (400 - 499)")
                    print("Les erreurs du serveur (500 - 599)")
                    return resp.status

    # async def create(self, keys, callback=None):
    #     try:
    #         assert (keys != {})
    #         assert (keys is not None)
    #     except EmptyKeyElementException:
    #         EmptyKeyElementException(keys).throw("empty json keys element")
    #     if self.session is None:
    #         print("session is not initialized !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    #         raise SessionNotInitializedExecption
    #     if self.session.closed:
    #         print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    #         raise ClosedSessionExecption
    #     url = self.serverURL + "/api/create/"
    #     headers = {'content-type': 'application/json'}
    #     headers.update(self.headers)
    #     data = json.dumps(keys)
    #     async with self.session.post(url, data=data, headers=headers, ssl=False) as resp:
    #         json_result = await resp.json()
    #         print("json requests result ==============================================={}".format(json_result))
    #         if resp.status < 300:
    #             try:
    #                 assert (json_result is not None)
    #             except NoneResultExecption:
    #                 NoneResultExecption().throw("Create returun None")
    #             if callback is None:
    #                 print("there is no call back provided")
    #                 print(json_result)
    #                 # await self.session.close()
    #                 return json_result
    #             else:
    #                 print("callbck given is {}".format(callback.__name__))
    #                 # await self.session.close()
    #                 return callback(json_result)
    #         else:
    #             print("Les erreurs du client (400 - 499)")
    #             print("Les erreurs du serveur (500 - 599)")
    #             return resp.status

    async def read(self, id, callback=None):
        try:
            assert (id != "")
            assert (id is not None)
        except EmptyKeyElementException:
            EmptyKeyElementException(id).throw("empty json keys element")
        async with self.session as session:
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/read/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(id)
            async with session.get(url, data=data, headers=headers, ssl=False) as resp:
                json_result = await resp.json()
                print("json requests result ==============================================={}".format(json_result))
                print(">>>>>>>>>>>>>>>>>>> read status code is {} <<<<<<<<<<<<<<<".format(resp.status))
                if resp.status < 300:
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Read return None")
                    if callback is None:
                        print("there is no call back provided")
                        # print(result)
                        print(json_result)
                        # await self.session.close()
                        return json_result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        # await self.session.close()
                        return callback(json_result)
                else:
                    print("Les erreurs du client (400 - 499)")
                    print("Les erreurs du serveur (500 - 599)")

    async def update(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys is not None)
        except EmptyKeyElementException:
            EmptyKeyElementException(keys).throw("empty json keys element")
        async with self.session as session:
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/update/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(keys)
            async with session.put(url, data=data, headers=headers, ssl=False) as resp:
                json_result = await resp.json()
                print("json requests result ==============================================={}".format(json_result))
                if resp.status < 300:
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create returun None")
                    if callback is None:
                        print("there is no call back provided")
                        print(json_result)
                        # await self.session.close()
                        return json_result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        # await self.session.close()
                        return callback(json_result)
                else:
                    print("client errors (400 - 499)")
                    print("server errors (500 - 599)")
                    return resp.status

    async def delete(self, id, callback=None):
        try:
            assert (id != "")
            assert (id is not None)
        except EmptyKeyElementException:
            EmptyKeyElementException(id).throw("empty json keys element")
        async with self.session as session:
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/delete/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(id)
            async with session.delete(url, data=data, headers=headers, ssl=False) as resp:
                json_result = await resp.json()
                print("json requests result ==============================================={}".format(json_result))
                print(">>>>>>>>>>>>>>>>>>> read status code is {} <<<<<<<<<<<<<<<".format(resp.status))
                if resp.status < 300:
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Read return None")
                    if callback is None:
                        print("there is no call back provided")
                        # print(result)
                        print(json_result)
                        # await self.session.close()
                        return json_result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        # await self.session.close()
                        return callback(json_result)
                else:
                    print("Les erreurs du client (400 - 499)")
                    print("Les erreurs du serveur (500 - 599)")


    async def signIn(self, username, password, callback=None):
        r = await requests.post(self.serverURL + '/api/signIn/', data={"username": username, "password": password},
                                verify=False)
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
