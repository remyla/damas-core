<img src="http://damas-software.com/bin/damas_logo.png" alt="damas-core"/>
# damas-core

damas-core contains a PHP server, a data model for MySQL, and the API implementation for Python an Javascript languages.

* HTTP stateless server written in Php
* Key-value, graph data model for MySQL
* Client bindings of the API for Python and Javascript languages

## Javascript
```html
<script type="text/javascript" src="damas.js"></script>
```

## Python
```python
import('damas.py')
```

## API

The API below is new from december 2014, and is not supported by the Python client implementation yet. For a Python compatible API, use the 2.2-stable release.

### Graphs

- damas.graph()
- damas.link()
- damas.links()
- damas.unlink()

### Nodes

- damas.create()
- damas.read()
- damas.update()
- damas.delete()
- damas.search()

### Trees

- damas.ancestors()
- damas.children()
- damas.move()

### Assets

- damas.backup()
- damas.increment()
- damas.upload()
- damas.lock()
- damas.unlock()

## Related Links

http://primcode.com PRIMCODE is the company hosting the development, distribution and maintenance of damas-core

http://damas-software.org the damas promotional website

## License
GPL License(GPLV3)

Copyright(c) 2015 Remy Lalanne remy@primcode.com

damas-core is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

damas-core is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with damas-core.  If not, see <http://www.gnu.org/licenses/>.
