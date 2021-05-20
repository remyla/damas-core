import aiohttp as aiohttp


class http_async_connection(object):
    def __init__(self, url):
        # self.cj = cookielib.LWPCookieJar()
        self.serverURL = url
        self.session = None
        self.response = None
        self.token = None
        self.headers = {}

    async def connect(self, loop):
        async with aiohttp.ClientSession(loop=loop) as session:
            self.session = session
            async with session.get(self.serverURL) as response:
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
                self.response = response
                return self.response
