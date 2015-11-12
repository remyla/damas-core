<img src="http://damas-software.org/bin/damas_software_logo.svg" alt="damas software logo"/>

Nodal digital asset management server and API

# Overview

## server-nodejs
A Javascript implementation of the server for NodeJS which developpement started in April 2015. Specifications redesign, enhanced graph structures, web token user authentication, integration of long-time requested features. MongoDB backend. This version is used in a production and stable. Some functions are still missing though, please see the documentation.

## server-php
A PHP server to run in a Apache environment. Generic key-value data model, simple graph structures, user authentication, file version control, using MySQL as database. It supports database replication among multiple sites. Used in production and maintained since 2007. The Php version is still used in production, very stable, and maintained. We intend to make it evolve to the new specifications some days. 

## API
The data can be remotely accessed from Python or Javascript, and using command line tools like curl.

Please visit the wiki's [API Reference](https://github.com/remyla/damas-core/wiki/API).

# Usage
Choose a server to run (either the Php or the NodeJS server). Refer at the README.md files in the servers folders for the installation instructions. Then use the Python or Javascript libraries to access it, of which instructions can be found in the wiki.

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
