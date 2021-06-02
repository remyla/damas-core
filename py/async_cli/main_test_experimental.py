import asyncio

# from py.async_cli.damas_sync_experimental import http_async_connection
#
from py.async_cli.damas_async import http_async_connection

lh = 'http://localhost:8090'
urls = [lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh]
loop = asyncio.get_event_loop()
damas = http_async_connection(lh, loop)

empty_key = {}
element_with_auto_generated_id_key = {"key2": "value2", "hello": "world"}
elt_with_specified_identifier_key = {"_id": "/project/folder/file11", "additional_key": "value"}
two_elements_key = {"_id": ["identifier1", "identifier2"], "key": "keyvalue"}
two_elements_using_an_array_as_id_key = {"_id": ["identifier3", "identifier4"], "key": "keyvalue1"}
graph_edge_element_key = {"_id": "/project/folder/file11", "tgt_id": "/project/folder/file2"}
json_elts_keys_list = [
    # empty_key,
    element_with_auto_generated_id_key,
    elt_with_specified_identifier_key,
    two_elements_key,
    two_elements_using_an_array_as_id_key,
    graph_edge_element_key
]
id0 = ""
id1 = elt_with_specified_identifier_key['_id']
id2 = two_elements_key['_id']
id3 = two_elements_using_an_array_as_id_key['_id']
id4 = graph_edge_element_key['_id']
ids = [id0, id1, id2, id3, id4]
ids = ["60b3c3de556cb538f2d8b1c6" for i in range(20)]


# @app.on_event("startup")
# async def startup(loop):
#     await app.connect(loop)

#
# @app.on_event("shutdown")
# async def shutdown():
#     await app.disconnect()

# def mycallback(**kwargs):
def mycallback(arg1, *args):
    print(arg1)
    print(args)
    res = "Printed args is :"
    for arg in args:
        res += "\n{}".format(arg)
    return res


async def test_connection(callback=None):
    print("------------------------- test_connection() started -------------------------")
    await damas.connect(callback)
    print("------------------------- test_connection() finished -------------------------")


async def test_connections_many(loop=loop, callback=None):
    print("------------------------- test_connections() started -------------------------")
    tasks = []
    for i in range(3):
        tasks.append(asyncio.ensure_future(damas.connect(callback)))
    await asyncio.gather(*tasks)
    print("------------------------- test_connections() finished -------------------------")


async def test_create(key={}, callback=None):
    print("================================>>> test_create started")
    print_type(key)
    await damas.create(key, callback)
    print("================================>>> test_create finished")


async def test_create_many_element(keys=[], count_request=1, callback=None):
    print("================================>>> test_create_many_element started")
    tasks = []
    for i in range(count_request):
        for key in keys:
            tasks.append(asyncio.ensure_future(damas.create(key, callback)))
    await asyncio.gather(*tasks)
    print("================================>>> test_create_many_element finished")


async def test_read(id="", callback=None):
    print("================================>>> test_read started")
    await damas.read(id, callback)
    print("================================>>> test_read finished")


async def test_read_many_element(ids=ids, count_request=1, callback=None):
    print("================================>>> test_read_many_element started")
    tasks = []
    for i in range(count_request):
        for id in ids:
            tasks.append(asyncio.ensure_future(damas.read(id, callback)))
    await asyncio.gather(*tasks)
    print("================================>>> test_create_many_element finished")


async def test_update(key={}, callback=None):
    print("================================>>> test_update started")
    print_type(key)
    await damas.update(key, callback)
    print("================================>>> test_update finished")


async def test_update_many_element(keys=[], count_request=10, callback=None):
    print("================================>>> test_update_many_element started")
    tasks = []
    for i in range(count_request):
        for key in keys:
            tasks.append(asyncio.ensure_future(damas.update(key, callback)))
    await asyncio.gather(*tasks)
    print("================================>>> test_create_many_element finished")


async def test_delete(id="", callback=None):
    print("================================>>> test_delete started")
    await damas.delete(id, callback)
    print("================================>>> test_delete finished")


async def test_delete_many_element(ids=ids, count_request=1, callback=None):
    print("================================>>> test_delete_many_element started")
    tasks = []
    for i in range(count_request):
        for id in ids:
            tasks.append(asyncio.ensure_future(damas.delete(id, callback)))
    await asyncio.gather(*tasks)
    print("================================>>> test_delete_many_element finished")


async def test_signIn(username, password, callback=None):
    print("================================>>> test_signIn started")
    damas = http_async_connection(lh)
    await asyncio.gather(
        damas.connect(loop, callback),
        damas.signIn(username, password)
    )
    print("================================>>> test_signIn finished")


def print_type(elt):
    print("{} is type of {}".format(elt, type(elt)))





async def main(loop):
    # quick_test(4,3,"hello","world",)
    # await damas.connect(
    #     readed=await test_read(elt_with_specified_identifier_key,
    #                            created=await test_create(elt_with_specified_identifier_key)
    #                            )
    # )
    #
    # await damas.connect()
    # await damas.create(elt_with_specified_identifier_key)
    # await damas.read(elt_with_specified_identifier_key['_id'])
    await damas.connect(print,"awaited request code","hello","worlrddddddddddddddddddddd")
    # await damas.connect(await damas.create(elt_with_specified_identifier_key['_id']))
    # await damas.read(elt_with_specified_identifier_key['_id'])
    # cor = await damas.connect( damas.read, elt_with_specified_identifier_key['_id'])
    # print("ressssssssssssssssssssssssss = {}".format(cor))
    # await test_connection()
    # await test_connection(print)
    # await test_connections_many()
    # await test_connections_many(print)
    # await test_create(None) # test EmptyKeyException
    # await test_create(empty_key) # test EmptyKeyException
    # await test_create(element_with_auto_generated_id_key)
    # await test_create(element_with_auto_generated_id_key, print)
    # await test_create(element_with_auto_generated_id_key)
    # await test_create(elt_with_specified_identifier_key)
    # await test_create(graph_edge_element_key["_id"]+"1")
    # await test_create(two_elements_using_an_array_as_id_key)
    # await test_create(elt_with_specified_identifier_key, print)
    #
    # await test_read(id0)
    # await test_read("60b3c3de556cb538f2d8b1c6", print)
    # await test_read("60ad1b1605f7c6c3ad890d67")
    # await test_read("60ad1b1605f7c6c3ad890d67",print)
    # await test_read(elt_with_specified_identifier_key['_id'])
    #
    # await test_update(id0) # test EmptyKeyException
    # await test_update({}) # test EmptyKeyException
    # await test_update(element_with_auto_generated_id_key) #throw bad request error 400
    # await test_update(element_with_auto_generated_id_key,print) #throw bad request error 400
    # await test_update(elt_with_specified_identifier_key)
    # await test_update(graph_edge_element_key)
    # await test_update(two_elements_using_an_array_as_id_key,print)
    # await test_update(elt_with_specified_identifier_key, print)
    #
    # await test_delete(id0)
    # await test_delete("60ad22f105f7c6c:3ad890d6e", print)
    # await test_delete("60b3c3de556cb538f2d8b1c6")
    # await test_delete(elt_with_specified_identifier_key['_id'])
    #
    # await test_create_many_element(json_elts_keys_list, 10, print)
    # await test_create_many_element(json_elts_keys_list, print)
    #
    # await test_read_many_element(ids, 10, print)
    # await test_read_many_element(ids, 10)
    #
    # await test_read_many_element(ids, 10, print)
    # await test_read_many_element(ids, 10)
    #
    # await test_update_many_element(json_elts_keys_list, print)
    # await test_update_many_element(json_elts_keys_list)
    #
    # await test_delete_many_element(ids, 10, print)
    # await test_delete_many_element(ids, 10)
    #
    # damas.disconnect()
    # await test_read("")
    pass


# async def senario():
#     res =


if __name__ == '__main__':
    try:
        # asyncio.run(main(loop))
        loop.run_until_complete(main(loop))
    finally:
        loop.close()
