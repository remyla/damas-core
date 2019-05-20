<img src="http://damas-software.org/bin/damas-core_logo.svg?t=1" alt="damas-core logo"/>

JSON storage service. RESTful, CRUD, multi-user.

[![Stories in Ready](https://badge.waffle.io/remyla/damas-core.png?label=ready&title=Ready)](https://waffle.io/remyla/damas-core)
![Licence](https://img.shields.io/github/license/remyla/damas-core.svg)
![Tag](https://img.shields.io/github/tag/remyla/damas-core.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/zankia/damas-node.svg)
![Docker Image](https://images.microbadger.com/badges/image/zankia/damas-node.svg)
# Overview

## server-nodejs
A NodeJS implementation of the server which development started in April 2015. Specifications redesign, enhanced graph structures, web token authentication, integration of long-time requested features. MongoDB backend. This version is used in production and stable and is the one we recommend.

## server-php
A PHP server to run in a Apache environment. Generic key-value data model, simple graph structures, user authentication, file version control, using MySQL as database. It supports database replication among multiple sites. Used in production and maintained since 2007. The Php version is still used in production, very stable, but based on older specifications. We intend to make it evolve to the new specifications some days.

## cli, js and py
Client API, Interfaces to access the server and its methods remotely:

* SHELL command line interface,
* Javascript module,
* Python module

The libraries use the native language objects to expose the JSON results. Older specs of the libraries can be found in the folders. The CLI is for the newer NodeJS version only.

# Usage
Choose a server to run (either the recommended NodeJS server or the Php server based on older specs). Please refer to the [Wiki](https://github.com/remyla/damas-core/wiki) for the installation instructions. Then use the Python, Javascript or CLI to access the server or install one of the interfaces available (see below). Your feedback is highly welcome.

# Related Links

http://damas-software.org is a website which presents the projects related to damas-core

https://syncplanet.io is a Saas using damas-core as backend

http://dabox.io is collaborative platform for architecture using damas-core as backend

https://github.com/PRIMCODE/damas-flow is a web flow graph interface based on the NodeJS server implementation which is being created since April 2015.

https://github.com/PRIMCODE/damas-dashboard is a web control center based on the NodeJS server implementation being developped since summer 2016, usable but not well packaged and documented yet. Get in touch if interested.

http://primcode.com PRIMCODE is the company behind the development, the distribution and the maintenance of damas-core

# Contributors
Remy Lalanne - Project lead  
Thibault Allard  
Julie Aresu  
Sebastien Courtois  
Ghislain Dugat  
Joaquin Galvan Angeles  
Stephane Hoarau  
Matthieu Humeau  
Mathieu Lalanne  
Axel Pisani
Axel Prat  
Mathieu Valero  
Quentin Villecroze

# License
GPL License(GPLV3)

Copyright(c) 2019 Remy Lalanne remy@primcode.com

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
