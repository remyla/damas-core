Event API
=========

The events fired by a damas-core server can be listened by an external process using [socket.io](https://socket.io/).

For the internal API specifications, and how it was implemented, please see [pull #112](https://github.com/remyla/damas-core/pull/112#issuecomment-218803699).

We provide three events:
- `create`
- `update`
- `remove` (delete)

# Javascript

Here is a sample JavaScript client (see [damas-socket.js](../js/damas-socket.js)):

```javascript

var address = location.protocol + '//' + location.host;
var socket = io.connect(address, { path: '/socket.io' });

window.addEventListener('beforeunload', function (event) {
    socket.close();
});

socket.on('connect', function () {
    console.log('Connected to the Socket server ' + address);
});

socket.on('disconnect', function (reason) {
    console.log('Disconnected: ' + reason);
});

socket.on('create', function (nodes) {
    console.log(nodes.length + ' nodes created');
    console.log(nodes);
});

socket.on('update', function (nodes) {
    console.log(nodes.length + ' nodes updated');
    console.log(nodes);
});

socket.on('remove', function (nodes) {
    console.log(nodes.length + ' nodes removed');
    console.log(nodes);
});
```

# Python

Here are examples to catch the events using [python-socketio](https://python-socketio.readthedocs.io/en/latest/client.html).
See the [sample Python websocket client](../py/damas_socket.py).

First, using asyncio module `socketio-async`:

```python
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
    await sio.connect('http://localhost')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())
```

Or using the standard threaded method:

```python
# Socketio Python client example for damas-core                                                                                                  
#
# pip install "python-socketio[client]"
#

import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')

@sio.event
def create(nodes):
    print('create')
    print(nodes)

@sio.event
def update(nodes):
    print('update')
    print(nodes)

@sio.event
def remove(nodes):
    print('remove')
    print(nodes)

sio.connect('http://localhost')
sio.wait()
```
