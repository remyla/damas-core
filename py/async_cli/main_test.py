import asyncio

# from py.async_cli.damas_sync_experimental import http_async_connection
#
import time

import py.async_cli.damas_async as da
import py.damas as ds

lh = 'http://localhost:8090'
urls = [lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh, lh]
loop = asyncio.get_event_loop()
damas_async = da.http_async_connection(lh, loop)
damas_sync = ds.http_connection(lh)

empty_key, element_with_auto_generated_id_key, elt_with_specified_identifier_key, two_elements_key, \
two_elements_using_an_array_as_id_key, graph_edge_element_key = {}, {}, {}, {}, {}, {}

id0, id1, id2, id3, id4 = "", "", "", "", ""
json_elts_keys_list, ids, queries, ids_to_delete, data_back_up = [], [], [], [], []


async def init_data():
    global element_with_auto_generated_id_key, elt_with_specified_identifier_key, \
        two_elements_using_an_array_as_id_key, two_elements_key, graph_edge_element_key
    global id0, id1, id2, id3, id4, ids
    global json_elts_keys_list, ids, queries, data_back_up
    element_with_auto_generated_id_key = {"key1": "value1", "hello": "world"}
    elt_with_specified_identifier_key = {"_id": "/project/folder/file1", "additional_key": "value1"}
    two_elements_key = {"_id": ["identifier1", "identifier2"], "key": "keyvalue"}
    two_elements_using_an_array_as_id_key = {"_id": ["identifier5", "identifier6"], "key": "keyvalue1"}
    graph_edge_element_key = {"_id": "/project/folder/file", "tgt_id": "/project/folder/file"}
    json_elts_keys_list = [{"": ""} for i in range(10)]
    id1 = elt_with_specified_identifier_key['_id']
    id2 = two_elements_key['_id']
    id3 = two_elements_using_an_array_as_id_key['_id']
    id4 = graph_edge_element_key['_id']
    damas_async.delete_all()
    for i in range(10):
        await damas_async.create({"": ""})
    ids = await damas_async.search("*")
    # ids = [id1, id2, id3, id4]
    # for elt in json_elts_keys_list: await damas_async.create(elt)
    await damas_async.search("*")


async def test_connection(callback=None):
    print("------------------------- test_connection() started -------------------------")
    # async test
    start_time = time.time()
    await damas_async.connect(callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    # start_time = time.time()
    # sync_damas
    # end_time = time.time()
    # sync_duration = end_time - start_time
    print("------------------------- async test_connection() finished in {} seconds -------------------------".format(
        async_duration))
    # print("------------------------- sync test_connection() finished in {} seconds -------------------------".format(sync_duration))


async def test_connections_many(callback=None, count_request=100):
    print("------------------------- {} test_connections() started -------------------------".format(count_request))
    # async test
    tasks = []
    start_time = time.time()
    for i in range(count_request):
        tasks.append(asyncio.ensure_future(damas_async.connect(callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    # start_time = time.time()
    # for i in range(count_request):
    #     damas.connect(callback)
    # end_time = time.time()
    # sync_duration = end_time - start_time
    print("-------------------------async test_connections() finished in {} seconds -------------------------".format(
        async_duration))
    # print("-------------------------sync test_connections() finished in {} seconds -------------------------".format(sync_duration))


async def test_create(key={}, callback=None):
    print("================================>>> test_create started")
    print(key)
    # async test
    start_time = time.time()
    await damas_async.create(key, callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    damas_sync.create(key)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_create finished in {} seconds".format(async_duration))
    print("================================>>> sync test_create finished in {} seconds".format(sync_duration))


async def test_create_many_element(keys=json_elts_keys_list, count_request=100, callback=None):
    print("================================>>> {} test_create_many_element started".format(count_request))
    # async test
    tasks = []
    start_time = time.time()
    for i in range(count_request):
        for key in keys:
            tasks.append(asyncio.ensure_future(da.http_async_connection(lh, loop).create(key, callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    for i in range(count_request):
        for key in keys:
            damas_sync.create(key)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_create_many_element finished in {} seconds".format(
        async_duration))
    print("================================>>> sync test_create_many_element finished in {} seconds".format(
        sync_duration))


async def test_read(id="", callback=None):
    print("================================>>> test_read started")
    # async test
    start_time = time.time()
    await da.http_async_connection(lh, loop).read(id, callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    damas_sync.read(id)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_read finished in {} seconds".format(async_duration))
    print("================================>>> sync test_read finished in {} seconds".format(sync_duration))


async def test_read_many_element(ids=ids, count_request=100, callback=None):
    print("================================>>> {} test_read_many_element started".format(ids.__len__() * count_request))
    # async test
    tasks = []
    start_time = time.time()
    for i in range(count_request):
        for id in ids:
            tasks.append(asyncio.ensure_future(da.http_async_connection(lh, loop).read(id, callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    for i in range(count_request):
        for id in ids:
            await da.http_async_connection(lh, loop).read(id)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_create_many_element finished in {} seconds".format(
        async_duration))
    print(
        "================================>>> sync test_create_many_element finished in {} seconds".format(
            sync_duration))


async def test_update(key=elt_with_specified_identifier_key, callback=None):
    print("================================>>> test_update started")
    print(key)
    # async test
    start_time = time.time()
    await da.http_async_connection(lh, loop).update(key, callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    damas_sync.update(key)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_update finished in {} seconds".format(async_duration))
    print("================================>>> sync test_update finished in {} seconds".format(sync_duration))


async def test_update_many_element(keys=json_elts_keys_list, count_request=10, callback=None):
    print("================================>>> {} test_update_many_element started".format(
        keys.__len__() * count_request))
    # async test
    tasks = []
    start_time = time.time()
    for i in range(count_request):
        for key in keys:
            tasks.append(asyncio.ensure_future(damas_async.update(key, callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    for i in range(count_request):
        for key in keys:
            damas_sync.create(key)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_update_many_element finished in {} seconds".format(
        async_duration))
    print("================================>>> sync test_update_many_element finished in {} seconds".format(
        sync_duration))


async def test_delete(id="", callback=None):
    print("================================>>> test_delete started")
    # async test
    start_time = time.time()
    await da.http_async_connection(lh, loop).delete(id, callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    damas_sync.delete(id)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_delete finished in {} seconds".format(async_duration))
    print("================================>>> sync test_delete finished in {} seconds".format(sync_duration))


async def test_delete_many_element(ids=ids, count_request=100, callback=None):
    print(
        "================================>>> {} test_delete_many_element started".format(ids.__len__() * count_request))
    # async test
    tasks = []
    start_time = time.time()
    for i in range(count_request):
        for id in ids:
            tasks.append(asyncio.ensure_future(da.http_async_connection(lh, loop).delete(id, callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    for i in range(count_request):
        for id in ids:
            ds.http_connection(lh).delete(id)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>>async test_delete_many_element finished in {} seconds".format(
        async_duration))
    print(
        "================================>>>sync test_delete_many_element finished in {} seconds".format(sync_duration))


async def test_search(query="*", callback=None):
    print("================================>>> test_search started")
    # async test
    start_time = time.time()
    await damas_async.search(query, callback)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    damas_sync.delete(query)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>> async test_search finished in {} seconds".format(async_duration))
    print("================================>>> sync test_search finished in {} seconds".format(sync_duration))


async def test_search_many_queries(queries=queries, count_request=100, callback=None):
    print(
        "================================>>> {} test_search_many_queries started".format(ids.__len__() * count_request))
    # async test
    tasks = []
    start_time = time.time()
    for query in queries:
        tasks.append(asyncio.ensure_future(da.http_async_connection(lh, loop).search(query, callback)))
    await asyncio.gather(*tasks)
    end_time = time.time()
    async_duration = end_time - start_time
    # sync test
    start_time = time.time()
    for i in range(count_request):
        for id in ids:
            ds.http_connection(lh).delete(id)
    end_time = time.time()
    sync_duration = end_time - start_time
    print("================================>>>async test_search_many_queries finished in {} seconds".format(
        async_duration))
    print(
        "================================>>>sync test_search_many_queries finished in {} seconds".format(sync_duration))


async def test_signIn(username, password, callback=None):
    print("================================>>> test_signIn started")
    start_time = time.time()
    await asyncio.gather(
        da.connect(loop, callback),
        da.signIn(username, password)
    )
    end_time = time.time()
    duration = end_time - start_time
    print("================================>>> test_signIn finished in {} seconds".format(duration))


async def test_init_data():
    await init_data()
    await damas_async.delete_all()


async def main(loop=loop):
    await init_data()
    await test_connection()
    await test_connection(print)
    await test_connections_many()
    await test_connections_many(print)
    # await test_create(None) # test EmptyKeyException
    # await test_create(empty_key) # test EmptyKeyException
    await test_create(element_with_auto_generated_id_key)
    await test_create(element_with_auto_generated_id_key, print)
    # await test_create(element_with_auto_generated_id_key)
    await test_create(elt_with_specified_identifier_key)
    await test_create(graph_edge_element_key)
    await test_create(two_elements_using_an_array_as_id_key)
    await test_create(two_elements_key, print)
    #
    await test_create_many_element(json_elts_keys_list, 10, print)
    # await test_create_many_element(json_elts_keys_list)
    #
    # await test_read("") # test EmptyKeyException
    # await test_read(None) # test EmptyKeyException
    await test_read(two_elements_key["_id"], print)  # no id   # raise FailedRequestException
    await test_read(two_elements_key["_id"][0])  # raise FailedRequestException
    await test_read(two_elements_key["_id"][1], print())
    await test_read(elt_with_specified_identifier_key['_id'])
    #
    await test_read_many_element(ids, 10, print)
    await test_read_many_element(ids)
    # await test_read_many_element(ids, 10, print)
    # await test_read_many_element(ids, 10)
    #
    # await test_update(id0) # test EmptyKeyException
    # await test_update({}) # test EmptyKeyException
    # await test_update(element_with_auto_generated_id_key, print) #raise bad request error 400 id is  auto_generated
    # await test_update(element_with_auto_generated_id_key,print) #raise bad request error 400  id is  auto_generated
    await test_update(elt_with_specified_identifier_key)
    await test_update(graph_edge_element_key)
    await test_update(two_elements_using_an_array_as_id_key, print)
    await test_update(elt_with_specified_identifier_key, print)
    #
    # await test_update_many_element(json_elts_keys_list, print)
    # await test_update_many_element(json_elts_keys_list)
    #
    # await test_delete(id0) # raise EmptyElementException
    # await test_delete("") # raise EmptyElementException
    await test_delete(two_elements_key["_id"][0])
    await test_delete(two_elements_key["_id"][1], print)
    # await test_delete(two_elements_key["_id"], print)      # raise NotFoundException(id) already deleted
    await test_delete(elt_with_specified_identifier_key['_id'])
    #
    await test_delete_many_element(ids, 10, print)
    await test_delete_many_element(ids, 10)
    #
    # damas_async.disconnect()
    data_back_up = await damas_async.search("*")
    await damas_async.delete_all()
    print(data_back_up)
    pass


if __name__ == '__main__':
    try:
        # loop.run_until_complete(test_init_data())
        loop.run_until_complete(main(loop))
    finally:
        loop.close()
