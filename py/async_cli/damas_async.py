import json

import aiohttp
import asyncio
import requests

from py.async_cli.DamasException import ClosedSessionExecption, EmptyElementException, NoneResultExecption, \
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

    async def connect(self, callback=None):
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            async with session.get(self.serverURL, ssl=False) as response:
                assert response.status == 200
                self.headers = response.headers
                print("-------------------------------- HTTP ",
                      self.serverURL,
                      "CONNECTION OK --------------------------------"
                      )
                self.response = response
                if callback is None:
                    print("there is no callback provided")
                    return self.response
                else:
                    res_callback = callback(self.response)
                    print("the {} callback is executed".format(callback.__name__))
                    if res_callback is None:
                        print("The call back return none. \nReturned value before callback is {}".format(self.response))
                        return self.response
                    return res_callback

    async def disconnect(self):
        await self.session.close()

    def set_new_session(self, loop):
        self.session = aiohttp.ClientSession(loop=loop)

    async def create(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys is not None)
        except EmptyElementException:
            raise EmptyElementException(keys)
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/create/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(keys)
            async with session.post(url, data=data, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create return None")
                    if callback is None:
                        print("There is no callback provided")
                        print(json_result)
                        return json_result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        callback_result = callback(json_result)
                        if callback_result is None:
                            print("The call back return none. \nReturned value before callback is {}".format(self.response))
                            return self.response
                    return callback_result
                else:
                    if resp.status == 409:
                        print("Code http create request error is {}".format(resp.status))
                        raise AlreadyExistException(keys)
                    print("Code http create request error is {}".format(resp.status))
                    print("Damas create request: client errors (400 - 499)")
                    print("Damas create request: server errors (500 - 599)")
                    raise FailedRequestException

    async def read(self, id, callback=None):
        try:
            assert (id != "")
            assert (id is not None)
        except EmptyElementException:
            EmptyElementException(id).throw("empty json keys element")
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
                    try:
                        assert json_result is not None
                    except NoneResultExecption:
                        NoneResultExecption().throw("Read return None")
                    if callback is None:
                        print("There is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("Callback given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    if resp.status == 404:
                        print("Code http read request error is {}".format(resp.status))
                        raise NotFoundException(id)
                    print("Code http create request error is {}".format(resp.status))
                    print("Damas read request: client errors (400 - 499)")
                    print("Damas read request: server errors (500 - 599)")
                    raise FailedRequestException

    async def read_all(self, callback=None):
        result = await http_async_connection(self.serverURL, self.loop).read(await self.search("*"))
        if callback is None:
            print("There is no call back provided")
            print(result)
            return result
        else:
            print("Callback given is {}".format(callback.__name__))
            return callback(result)

    async def update(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys is not None)
        except EmptyElementException:
            EmptyElementException(keys).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("Session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/update/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = json.dumps(keys)
            async with session.put(url, data=data, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Update return None")
                    if callback is None:
                        print("There is no callback provided")
                        print(json_result)
                        return json_result
                    else:
                        print("Callback given is {}".format(callback.__name__))
                        callback_result = callback(json_result)
                        if callback_result is None:
                            print("The call back return none. \nReturned value before callback is {}".format(self.response))
                            return self.response
                    return callback_result
                else:
                    if resp.status == 409:
                        print("Code http update request error is {}".format(resp.status))
                        raise AlreadyExistException(keys)
                    print("Code http update request error is {}".format(resp.status))
                    print("Damas update request: client errors (400 - 499)")
                    print("Damas update request: server errors (500 - 599)")
                    raise FailedRequestException

    async def delete(self, id, callback=None):
        try:
            assert (id != "")
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
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert json_result is not None
                    except NoneResultExecption:
                        NoneResultExecption().throw("Delete return None")
                    if callback is None:
                        print("There is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("Callback given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    if resp.status == 404:
                        print("Code http delete request error is {}".format(resp.status))
                        raise NotFoundException(id)
                    print("Code http delete request error is {}".format(resp.status))
                    print("Damas delete request: client errors (400 - 499)")
                    print("Damas delete request: server errors (500 - 599)")
                    raise FailedRequestException

    async def delete_all(self, callback=None):
        result = await http_async_connection(self.serverURL, self.loop).delete(await self.search("*"))
        if callback is None:
            print("There is no call back provided")
            print(result)
            return result
        else:
            print("Callback given is {}".format(callback.__name__))
            return callback(result)

    async def search(self, query, callback=None):
        try:
            assert (query != "")
            assert (query is not None)
        except EmptyElementException:
            EmptyElementException(id).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/search/" + query
            headers = self.headers
            async with session.get(url, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert json_result is not None
                    except NoneResultExecption:
                        NoneResultExecption().throw("Delete return None")
                    if callback is None:
                        print("There is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("Callback given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    if resp.status == 404:
                        print("Code http delete request error is {}".format(resp.status))
                        raise NotFoundException(id)
                    print("Code http search request error is {}".format(resp.status))
                    print("Damas search request: client errors (400 - 499)")
                    print("Damas search_one request: server errors (500 - 599)")
                    raise FailedRequestException

    async def search_one(self, query, callback=None):
        try:
            assert (query != "")
            assert (query is not None)
        except EmptyElementException:
            EmptyElementException(id).throw("empty json keys element")
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/search_one/" + query
            headers = self.headers
            async with session.get(url, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert json_result is not None
                    except NoneResultExecption:
                        NoneResultExecption().throw("Delete return None")
                    if callback is None:
                        print("There is no call back provided")
                        print(json_result)
                        return json_result
                    else:
                        print("Callback given is {}".format(callback.__name__))
                        return callback(json_result)
                else:
                    if resp.status == 404:
                        print("Code http delete request error is {}".format(resp.status))
                        raise NotFoundException(id)
                    print("Code http search_one request error is {}".format(resp.status))
                    print("Damas search_one request: client errors (400 - 499)")
                    print("Damas search_one request: server errors (500 - 599)")
                    raise FailedRequestException

    async def signIn(self, username, password, callback=None):
        try:
            assert (username != "")
            assert (username is not None)
        except EmptyElementException:
            raise EmptyElementException(username)
        try:
            assert (password != "")
            assert (password is not None)
        except EmptyElementException:
            raise EmptyElementException(password)
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/signIn/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            data = {"username": username, "password": password}
            async with session.post(url, data=data, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    if resp.status == 200:
                        json_result = await resp.json()
                        try:
                            assert json_result is not None
                        except NoneResultExecption:
                            NoneResultExecption().throw("Create return None")
                        self.token = json.loads(json_result)
                        self.headers["Authorization"] = 'Bearer ' + self.token['token']
                        if callback is None:
                            print("There is no callback provided")
                            print(json_result)
                            return json_result
                        else:
                            print("callback given is {}".format(callback.__name__))
                            callback_result = callback(json_result)
                            if callback_result is None:
                                print("The call back return none. \nReturned value before callback is {}".format(
                                    self.response))
                                return self.response
                        return callback_result
                    return False
                else:
                    # if resp.status == 409:
                    #     print("Code http create request error is {}".format(resp.status))
                    #     raise AlreadyExistException(keys)
                    print("Code http signIn request error is {}".format(resp.status))
                    print("Damas signIn request: client errors (400 - 499)")
                    print("Damas signIn request: server errors (500 - 599)")
                    raise FailedRequestException

    def signOut(self):
        self.token = None
        del self.headers['Authorization']

    async def verify(self, callback=None):
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session =session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/verify/"
            headers = self.headers
            async with session.get(url, headers=headers,ssl=False) as resp:
                assert resp is not None
                if resp.status == 200:
                    json_result = await resp.json()
                    try:
                        assert json_result is not None
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create return None")
                    if callback is None:
                        print("There is no callback provided")
                        print(json_result)
                        return True
                    else:
                        print("callback given is {}".format(callback.__name__))
                        callback_result = callback(json_result)
                        if callback_result is None:
                            print("The call back return none. \nReturned value before callback is {}".format(
                                self.response))
                            return True
                        return callback_result
                        return True
                else:
                    # if resp.status == 409:
                    #     print("Code http create request error is {}".format(resp.status))
                    #     raise AlreadyExistException(keys)
                    print("Code http verify request error is {}".format(resp.status))
                    print("Damas verify request: client errors (400 - 499)")
                    print("Damas verify request: server errors (500 - 599)")
                    return False

    async def comment(self, keys, callback=None):
        try:
            assert (keys != {})
            assert (keys is not None)
        except EmptyElementException:
            raise EmptyElementException(keys)
        async with aiohttp.ClientSession(loop=self.loop) as session:
            self.session = session
            if self.session.closed:
                print("session is closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                raise ClosedSessionExecption
            url = self.serverURL + "/api/comment/"
            headers = {'content-type': 'application/json'}
            headers.update(self.headers)
            async with session.post(url, headers=headers, ssl=False) as resp:
                assert resp is not None
                if resp.status < 300:
                    json_result = await resp.json()
                    try:
                        assert (json_result is not None)
                    except NoneResultExecption:
                        NoneResultExecption().throw("Create return None")
                    result = json.loads(json_result)
                    if callback is None:
                        print("There is no callback provided")
                        print(result)
                        return result
                    else:
                        print("callback given is {}".format(callback.__name__))
                        callback_result = callback(result)
                        if callback_result is None:
                            print("The call back return none. \nReturned value before callback is {}".format(self.response))
                            return self.response
                    return callback_result
                else:
                    if resp.status == 409:
                        print("Code http create request error is {}".format(resp.status))
                        raise AlreadyExistException(keys)
                    print("Code http create request error is {}".format(resp.status))
                    print("Damas create request: client errors (400 - 499)")
                    print("Damas create request: server errors (500 - 599)")
                    raise FailedRequestException


