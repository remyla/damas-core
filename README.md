<img src="http://damas-software.com/bin/damas_logo.png" alt="damas-core"/>

http://damas-software.org

# damas-core

Digital asset management server source code

## Usage
Choose a server to run (either the Php or the NodeJS server) and use the Python or Javascript libraries to access it.

The NodeJS is currently under development. For stable versions (currently Php only) please have a look at the releases.

### Javascript
```html
<script type="text/javascript" src="damas.js"></script>
```
or
```js
require('damas.js');
```

### Python
```python
import damas
```

## API

The API below is new from december 2014, and is not supported by the Python client implementation yet. For a Python compatible API, use the 2.2-stable release.

### Node manipulation

- damas.create( keys )
- damas.read( id )
- damas.update( id, keys )
- damas.delete( id )
- damas.search( query )

### Node graphs 

- damas.graph( id )
- damas.link( sourceId , targetId )
- damas.links( id )
- damas.unlink( linkId )


### Trees, based on a #parent key

- damas.ancestors( id )
- damas.children( id )
- damas.move( id, target )

### Asset manipulation (version control)

- damas.backup( id )
- damas.increment( id )
- damas.upload( files )
- damas.lock( id )
- damas.unlock( id )

## Related Links

http://primcode.com PRIMCODE is the company leading the development, the distribution and the maintenance of damas-core

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
