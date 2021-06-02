#!/usr/bin/env python
# encoding:utf-8

import asyncio
import requests
import time


async def download(url): # A function defined by async def is a native coprocess object
    response = requests.get(url)
    print(response.text)


async def wait_download(url):
    await download(url) # Here download(url) is a native collaboration object
    print("get {} data complete.".format(url))


async def main():
    start = time.time()
    await asyncio.wait([
        wait_download("http://www.163.com"),
        wait_download("http://www.mi.com"),
        wait_download("http://www.google.com")])
        # download("http://www.163.com"),
        # download("http://www.mi.com"),
        # download("http://www.google.com")])
    end = time.time()
    print("Complete in {} seconds".format(end - start))


loop = asyncio.get_event_loop()
loop.run_until_complete(main())