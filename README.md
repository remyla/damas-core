<img src="http://damas-software.com/bin/damas_logo.png" alt="damas-core"/>

Digital asset management server and API

# Overview
## server-php
A PHP server to run in a Apache/MySQL environment. It contains a generic key-value data model supporting simple graph structures. Contains user authentication, file upload, file version control. It supports database replication among multiple sites. Used in production and maintained since 2007.

## server-nodejs
A new Javascript implementation of the server for NodeJS which is developped since April 2015. Specifications redesign, enhanced graph structures, integration of long-time requested features. MongoDB backend. Alpha stage of development.

## API
The data can be remotely accessed from Python or Javascript, and using command line tools like curl.

Please visit the wiki's [API Reference](https://github.com/remyla/damas-core/wiki/API).

# Usage
Choose a server to run (either the Php or the NodeJS server) and use the Python or Javascript libraries to access it.

The NodeJS server is currently under development. For stable versions (currently Php only) please have a look at the releases. For a full Python compatible API, use the 2.2-stable release.

# Related Links

https://github.com/PRIMCODE/damas-flow is a flow graph interface based on the NodeJS server implementation which is being created since April 2015.

http://dabox.io is collaborative platform for architecture using damas-core as backend

http://damas-software.org is a website which presents the works related to damas-core

http://primcode.com PRIMCODE is the company behind the development, the distribution and the maintenance of damas-core


# License
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
