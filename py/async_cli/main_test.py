import asyncio

from py.async_cli.damas_async import http_async_connection


connectionCounter = 0


async def testConnections(loop,urls):
    tasks = [await http_async_connection(url).connect(loop) for url in urls]
    await asyncio.gather(*tasks)
    # connectionCounter += 1



async def main(loop):
    lh = 'http://localhost:8090/'
    urls = [lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh]
    # urls = [
    #     "http://www.irs.gov/pub/irs-pdf/f1040.pdf",
    #     "http://www.irs.gov/pub/irs-pdf/f1040a.pdf",
    #     "http://www.irs.gov/pub/irs-pdf/f1040ez.pdf",
    #     "http://www.irs.gov/pub/irs-pdf/f1040es.pdf",
    #     "http://www.irs.gov/pub/irs-pdf/f1040sb.pdf"
    # ]
    await testConnections(loop,urls)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main(loop))
    finally:
        loop.close()