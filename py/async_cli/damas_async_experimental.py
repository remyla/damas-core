import json
from inspect import isawaitable

import aiohttp
import asyncio
import requests

from py.async_cli.DamasException import EmptyElementException, NoneResultExecption, ClosedSessionExecption, \
    FailedRequestException
from py.async_cli.DamasException.AlreadyExistException import AlreadyExistException
from py.async_cli.DamasException.NotFoundException import NotFoundException


class http_async_connection(object):
    def __init__(self, url, loop=asyncio.get_event_loop()):
        self.loop = loop
        self.serverURL = url
        self.session = None
        self.response = None
        self.token = None
        self.headers = {}
        #
        self.callback_to_resolve = []
        self.all_callback_are_resolved = False
        self.awaited_data = None
        #
        self.futures = []
        # self.run_pending_futures()

    async def next_step(self, callback):
        if self.all_callback_are_resolved:

            await callback(*self.awaited_data)
        else:
            self.callback_to_resolve.append(callback)

    async def resolve_callback(self, *args):
        if not self.all_callback_are_resolved:
            self.all_callback_are_resolved = True
            self.awaited_data = args
            for callback in self.callback_to_resolve:
                callback(*args)

    def run_pending_futures(self):
        # self.futures = self.
        # while True:
        #     asyncio.gather(*self.futures)
        pass

    async def connect(self, callback=None, *others_callback_parameters):
        print("start connecting ... PARAMATER")
        print("callback = {}".format(callback))
        print("others_callback_parameters = {}".format(others_callback_parameters))
        async with aiohttp.ClientSession(loop=self.loop) as session:
        # async with self.session as session:
            # self.session = session
            async with session.get(self.serverURL, ssl=False) as response:
                if response.status >= 300:
                    print("Damas connect request: client errors (400 - 499)")
                    print("Damas connect request: server errors (500 - 599)")
                    raise FailedRequestException
                assert response.status == 200
                # print("Status:", response.status)
                self.headers = response.headers
                # print("Content-type:", self.headers['content-type'])
                html = await response.text()
                # print("Body", html)
                print("-------------------------------- HTTP ",
                      self.serverURL,
                      "CONNECTION OK --------------------------------"
                      )
                # print("==============================================================================================")
                # print("==============================================================================================")
                # print("|| RESPONSE SERVER = {} ||".format(response))
                # print("==============================================================================================")
                # print("==============================================================================================")
                self.response = response
                if callback is None:
                    print("there is no call back provided")
                    return self.response
                else:
                    print("The awaited request code = {}".format(self.response.status))
                    if isawaitable(callback):
                        res_callback = await asyncio.ensure_future(callback(*others_callback_parameters))
                    res_callback = asyncio.ensure_future(callback(*others_callback_parameters))
                    # print("{} callback result is = {}".format(callback.__name__),res_callback)
                    print("the call back is executed")
                    if res_callback is None:
                        print("the call back return none. return value before callback is {}".format(self.response))
                        return self.response
                    return res_callback

    async def read(self, id, callback=None, *others_callback_parameters):
        try:
            assert (id != "")
            assert (id is not None)
        except EmptyElementException:
            # raise EmptyKeyElementException
            # print(EmptyKeyElementException(id).__str__)
            print("Empty key id")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/read/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(id)
            async with session.get(url, data=data, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    print("json requests result ==============================================={}".format(json_result))
                    print(">>>>>>>>>>>>>>>>>>> read status code is {} <<<<<<<<<<<<<<<".format(resp.status))
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Read return None")
                    if callback is None:
                        print("there is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("callbck given is {}".format(callback.__name__))
                        # callback_result = await callback(json_result, *others_callback_parameters)
                        callback_result = await callback(*others_callback_parameters)
                        return callback_result
                else:
                    if resp.status == 404:
                        raise NotFoundException(id)
                    print("Damas read request: client errors (400 - 499)")
                    print("Damas read request: server errors (500 - 599)")
                    raise FailedRequestException


    # async def connect(self, callback=None, **kwargs):
    #     if callback is not None:
    #         print("kwargs ================== {}".format(kwargs))
    #     async with aiohttp.ClientSession(loop=self.loop) as session:
    #         self.session = session
    #         async with session.get(self.serverURL, ssl=False) as response:
    #             assert response.status == 200
    #             # print("Status:", response.status)
    #             self.headers = response.headers
    #             # print("Content-type:", self.headers['content-type'])
    #             html = await response.text()
    #             # print("Body", html)
    #             print("-------------------------------- HTTP ",
    #                   self.serverURL,
    #                   "CONNECTION OK --------------------------------"
    #                   )
    #             # print("==============================================================================================")
    #             # print("==============================================================================================")
    #             # print("|| RESPONSE SERVER = {} ||".format(response))
    #             # print("==============================================================================================")
    #             # print("==============================================================================================")
    #             self.response = response
    #             if callback is None:
    #                 print("there is no call back provided")
    #                 return self.response
    #             else:
    #                 res_callback = callback(self.response)
    #                 print("the call back is executed")
    #                 # res_callback = callback(self.response)
    #                 # print("damas{}.connect: call back is executed"
    #                 #       .format(type(self.__str__()))
    #                       # )
    #                 if res_callback is None:
    #                     print("damas{}.connect:the call back return none. return value before callback is {}".format(self, self.response))
    #                     return self.response
    #                 return res_callback

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

    async def create(self, keys, callback=None, *others_callback_parameters):
        try:
            assert (keys != {})
            assert (keys != "")
            assert (keys is not None)
        except EmptyElementException:
            EmptyElementException(keys).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                # print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
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
                if resp.status < 300:
                    print("request response is {}".format(resp))
                    json_result = await resp.json()
                    # print("json requests result ==============================================={}".format(json_result))
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create return None")
                    if callback is None:
                        print("there is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("callbck given is {}".format(callback.__name__))
                        callback_result = await callback(json_result, *others_callback_parameters)
                        return callback_result
                else:
                    if resp.status == 409:
                        raise AlreadyExistException(keys)
                    print("client errors (400 - 499)")
                    print("server erros (500 - 599)")
                    # return resp.status
                    raise FailedRequestException

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


    async def update(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys != "")
            assert (keys is not None)
        except EmptyElementException:
            EmptyElementException(keys).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/update/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.loads(json.dumps(keys))
            print(type(data))
            print(keys)
            async with session.put(url, data=data
                                   # , headers=headers, ssl=False
                                   ) as resp:
                assert resp is not None
                if resp.status < 300:
                    print("request response is {}".format(resp))
                    json_result = await resp.json()
                    print("json requests result ==============================================={}".format(json_result))
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create return None")
                    if callback is None:
                        print("there is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    print("client errors (400 - 499)")
                    print("server errors (500 - 599)")
                    print("http error code = {}".format(resp.status))
                    if resp.status == 400:
                        raise NotFoundException(keys)
                    # return resp.status
                    raise FailedRequestException


    async def delete(self, id, callback=None):
        try:
            assert (id != "")
            assert (id != {})
            assert (id is not None)
        except EmptyElementException:
            EmptyElementException(id).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/delete/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(id)
            async with session.delete(url, data=data, headers=headers, ssl=False) as resp:
                print(resp.status)
                if resp.status < 300:
                    json_result = await resp.json()
                    print("json requests result ==============================================={}".format(json_result))
                    print(">>>>>>>>>>>>>>>>>>> read status code is {} <<<<<<<<<<<<<<<".format(resp.status))
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
                    if resp.status == 404:
                        raise NotFoundException(id)
                    print("Les erreurs du client (400 - 499)")
                    print("Les erreurs du serveur (500 - 599)")
                    raise FailedRequestException

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
