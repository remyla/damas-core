import sys

import aiohttp
import asyncio
import async_timeout
import os


async def download_coroutine(session, url):
    with async_timeout.timeout(1):
        async with session.get(url) as response:
            filename = os.path.basename(url)
            with open(filename, 'wb') as f_handle:
                while True:
                    chunk = await response.content.read(1024)
                    if not chunk:
                        break
                    f_handle.write(chunk)
            return await response.release()


async def main(loop):
    urls = ["http://www.irs.gov/pub/irs-pdf/f1040.pdf",
            "http://www.irs.gov/pub/irs-pdf/f1040a.pdf",
            "http://www.irs.gov/pub/irs-pdf/f1040ez.pdf",
            "http://www.irs.gov/pub/irs-pdf/f1040es.pdf",
            "http://www.irs.gov/pub/irs-pdf/f1040sb.pdf"]
    async with aiohttp.ClientSession(loop=loop) as session:
        tasks = [download_coroutine(session, url) for url in urls]
        await asyncio.gather(*tasks)


class B(Exception): pass


class C(B): pass


class D(C): pass


def test_exception():
    for arg in sys.argv[1:]:
        try:
            arg = "myfile.txt"
            f = open(arg, 'r')
            print("{file} is opened".format(arg))
        except IOError:
            print('cannot open', arg)
        else:
            print(arg, 'has', len(f.readlines()), 'lines')
            f.close()
    # try:
    #     f = open('myfile.txt')
    #     s = f.readline()
    #     i = int(s.strip())
    # except OSError as err:
    #     print("OS error: {0}".format(err))
    # except ValueError:
    #     print("Could not convert data to an integer.")
    # except:
    #     print("Unexpected error:", sys.exc_info()[0])
    #     raise



if __name__ == '__main__':
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(main(loop))
    test_exception()
