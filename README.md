<img src="http://damas-software.org/bin/damas-core_logo.svg?t=2" alt="damas-core logo"/>

JSON storage service. RESTful, CRUD, multi-user.

[![Stories in Ready](https://badge.waffle.io/remyla/damas-core.png?label=ready&title=Ready)](https://waffle.io/remyla/damas-core)
![Licence](https://img.shields.io/github/license/remyla/damas-core.svg)
![Tag](https://img.shields.io/github/tag/remyla/damas-core.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/zankia/damas-node.svg)
![Docker Image](https://images.microbadger.com/badges/image/zankia/damas-node.svg)
# Overview

## server-nodejs
damas-core server in NodeJS which development started in April 2015. Specifications redesign, enhanced graph structures, json web tokens, integration of long-time requested features. MongoDB backend. This version is used in production and stable and is the one we recommend.

## server-php
Older damas-core server written in PHP to run in a Apache environment. Generic key-value data model, simple graph structures, user authentication, file version control, using MySQL as database. It supports database replication among multiple sites. Used in production and maintained since 2007. The Php version is still used in production, very stable, but based on older specifications. We intend to make it evolve to the new specifications some days.

## clients: py, js and cli
Interfaces to access the server and its API:

* Python module
* Javascript module
* Shell command line interface

Try the demo server and the API: https://demo.damas.io.

# Usage
Run a server and get started [here](https://github.com/remyla/damas-core/wiki).

# Related Links
https://demo.damas.io a public demo server running damas-core server NodeJS in docker

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
