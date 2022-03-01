
import damas, async_damas
import asyncio

async def main():
    conn = async_damas.http_connection("http://localhost")
    callback = conn.callback()
    keys = None
    # res = await conn.search1("*")
    res = await conn.create(keys, callback)

    print(res)
asyncio.run(main())
