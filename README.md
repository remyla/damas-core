[![Stories in Ready](https://badge.waffle.io/remyla/damas-core.png?label=ready&title=Ready)](https://waffle.io/remyla/damas-core)

<img src="http://damas-software.org/bin/damas_software_logo.svg" alt="damas software logo"/>

Servers and client libraries for nodal digital asset management

# Overview

## server-nodejs
A Javascript implementation of the server for NodeJS which development started in April 2015. Specifications redesign, enhanced graph structures, web token authentication, integration of long-time requested features. MongoDB backend. This version is used in production and stable. Some functions are still missing though, please see the documentation.

## server-php
A PHP server to run in a Apache environment. Generic key-value data model, simple graph structures, user authentication, file version control, using MySQL as database. It supports database replication among multiple sites. Used in production and maintained since 2007. The Php version is still used in production, very stable, and maintained. We intend to make it evolve to the new specifications some days. 

## py and js
The Python and Javascript libraries to access the server remotely, interface its methods and process the JSON results using the language native objects.

# Usage
Choose a server to run (either the Php or the NodeJS server). Refer to the README.md files in the servers folders for the installation instructions. Then use the Python or Javascript libraries to access it, of which instructions can be found in the [Wiki](https://github.com/remyla/damas-core/wiki) or install one of the interfaces available (see below). Your feedback is highly welcome.

# Related Links

http://damas-software.org is a website which presents the projects related to damas-core

http://dabox.io is collaborative platform for architecture using damas-core as backend

https://github.com/PRIMCODE/damas-flow is a web flow graph interface based on the NodeJS server implementation which is being created since April 2015.

https://github.com/PRIMCODE/damas-dashboard is a web control center based on the NodeJS server implementation being developped since summer 2016, usable but not well packaged and documented yet. Get in touch if interested.

http://primcode.com PRIMCODE is the company behind the development, the distribution and the maintenance of damas-core

# License
GPL License(GPLV3)

Copyright(c) 2016 Remy Lalanne remy@primcode.com

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
