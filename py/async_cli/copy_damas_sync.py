import json
from sys import argv

import aiohttp as aiohttp
import requests
import unittest as ut
import requests as req

from py.async_cli.DamasException import EmptyKeyElementException


class http_async_connection(object):
    def __init__(self, url):
        # self.cj = cookielib.LWPCookieJar()
        self.serverURL = url
        self.session = None
        self.response = None
        self.token = None
        self.headers = {}

    async def connect(self, loop, callback=None):
        async with aiohttp.ClientSession(loop=loop) as session:
            self.session = session
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
                        print("the call back return none")
                        return self.response
                    return res_callback


    async def create(self, keys, callback=None):
        '''
        Create a node wearing the specified keys
        @param {Hash} keys of the new node
        @returns {Hash} New node on success, false otherwise
        '''
        try:
            ut.assertNotEqual(keys,"{}")
        except EmptyKeyElementException:
            EmptyKeyElementException().throw()
        headers = {'content-type': 'application/json'}
        headers.update(self.headers)
        res = None
        # r = await requests.post(self.serverURL + "/api/create/", data=json.dumps(keys), headers=headers, verify=False)
        r = requests.post(self.serverURL + "/api/create/", data=json.dumps(keys), headers=headers, verify=False)
        if r.status_code == 201 or r.status_code == 207:
            res = json.loads(r.text)
            # try:
            #     ut.assertNotEqual(res, None)

            # return res
        if callback != None:
            return callback(res)
        else:
            return res
