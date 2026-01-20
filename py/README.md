Python API
==========

# Install

1. Install the `requests` module:

> with pip:
```sh
pipenv install requests
```

> or with Debian:
```sh
apt install python-requests
```

2. Get the [damas-core client module for Python](damas_client.py)

# Start
In a Python console:

<pre>
<span class="comment"># load the module</span>
>>> import damas_client

<span class="comment"># connect to the server</span>
>>> project = damas.http_connection(<span class="arg">"<span id="server_url">https://serveripaddr</span>"</span>)

<span class="comment"># list every node identifiers</span>
>>> project.search(<span class="arg">"*"</span>)

<span class="comment"># read every nodes</span>
>>> project.read(project.search(<span class="arg">"*"</span>))

<span class="comment"># create an empty element</span>
>>> project.create(<span class="arg">{}</span>)

<span class="comment"># create a new element wearing keys</span>
>>> project.create(<span class="arg">{"key1":"value1","key2":"value2"}</span>)
{u'key2': u'value2', u'key1': u'value1', u'time': 1437469470133, u'_id': u'55ae0b1ed81e88357d77d0e9', u'author': u'xxx.xxx.xxx.xxx'}

# search for this element using the key it is wearing
>>> project.search(<span class="arg">"key1:value1"</span>)
[u'55ae0b1ed81e88357d77d0e9']

# read the node index
>>> project.read(<span class="arg">'55ae0b1ed81e88357d77d0e9'</span>)
[{u'key2': u'value2', u'key1': u'value1', u'time': 1437469470133, u'_id': u'55ae0b1ed81e88357d77d0e9', u'author': u'xxx.xxx.xxx.xxx'}]
</pre>

Visit the [API-Reference](/doc/3-API-Reference.md) for the documentation.

# Additional Python ressources

[damas_socket.py](damas_socket.py) is a module to connect to a damas-core server using Socketio websockets. See [Event-API](/doc/Events-API.md).
