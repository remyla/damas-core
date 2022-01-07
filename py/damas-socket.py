# Socketio Python client example for damas-core                                                                                     
#
# pip install "python-socketio[asyncio_client]"
#

import asyncio
import socketio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print('connection established')

@sio.event
async def disconnect():
    print('disconnected from server')

@sio.event
async def create(nodes):
    print('create')
    print(nodes)

@sio.event
async def update(nodes):
    print('update')
    print(nodes)

@sio.event
async def remove(nodes):
    print('remove')
    print(nodes)

async def main():
    await sio.connect('https://demo.damas.io')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())


