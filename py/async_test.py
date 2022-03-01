
import damas, async_damas
import asyncio
import json
async def main():
    conn = async_damas.http_connection("http://localhost")
    def callback(r):
        if r.status_code == 201 or r.status_code == 207:
            return (r.status_code, json.loads(r.text))
        return (r.status_code, r.text)

    keys = None
    # res = await conn.search1("*")
    res = await conn.create(keys, callback)

    print(res)
asyncio.run(main())
