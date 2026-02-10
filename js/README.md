
Javascript API
==============

# Run in this Web Page

Open a console (press Ctrl+Shift+k or F12) to start writing commands:

<noscript>
    Javascript must be enabled.
</noscript>

<pre>
damas-core API loaded

<span class="comment">// list every elements identifiers</span>
damas.search(<span class="arg">'*'</span>);

<span class="comment">// read every elements</span>
damas.read(damas.search(<span class="arg">'*'</span>));

<span class="comment">// create an empty element</span>
damas.create(<span class="arg">{}</span>);
</pre>

# Run in a new Web Page

Load the [AMD module](damas.js) using `require()` or using an html `<script>` tag.

```
<script src="damas.js"></script>
```

Open a console and start using the API as explained above.

# Run in a Project
The [AMD module](damas.js) is available in the npm module library. Install the module using NPM:
```
npm install damas-core-client
```

Then edit your Javascript:
<pre>
<span class="comment"> // load the module</span>
const damas = require(<span class="arg">'damas-core-client'</span>);

<span class="comment">// connect to this server</span>
damas.server = <span class="arg">'<span id="server_url">https://serveripaddr</span>'</span>;
</pre>


# Additional JS ressources

[damas-socket.js](damas-socket.js) is a module to connect to a damas-core server using websockets. See [Event-API](/docs/Events-API.md).
