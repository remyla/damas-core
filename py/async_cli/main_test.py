import asyncio

from py.async_cli.damas_async import http_async_connection


lh = 'http://localhost:8090/'
loop = asyncio.get_event_loop()
app = http_async_connection(lh)


@app.on_event("startup")
async def startup(loop):
    await app.connect(loop)


@app.on_event("shutdown")
async def shutdown():
    await app.disconnect()


async def test_connections(loop, urls):
    tasks = [await http_async_connection(url).connect(loop) for url in urls]
    await asyncio.gather(*tasks)


async def test_create(http_connection, nodes):
    await http_connection.create(nodes)


async def main(loop):
    urls = [lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh]
    # await test_connections(loop, urls)
    #
    #

    empty_node = {}
    element_with_auto_enerated_id = {"key1":"value1"}
    elt_with_specified_identifier = {"_id":"/project/folder/file", "additional_key":"value"}
    two_elements = {"_id":["identifier1","identifier2"],"key":"keyvalue"}
    two_elements_using_an_array_as_id = {"src_id":"/project/folder/file1","tgt_id":"/project/folder/file2"}
    nodes= [
        empty_node,
        element_with_auto_enerated_id,
        elt_with_specified_identifier,
        two_elements,
        two_elements_using_an_array_as_id
    ]
    await test_create(app, nodes)


if __name__ == '__main__':
    try:
        loop.run_until_complete(main(loop))
    finally:
        loop.close()
