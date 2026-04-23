damas-core ![Licence](https://img.shields.io/github/license/remyla/damas-core) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/remyla/damas-core) ![Docker Pulls](https://img.shields.io/docker/pulls/primcode/damas-core) ![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/primcode/damas-core)
==========
```
     _
  __| | __ _ _ __ ___   __ _ ___        ___ ___  _ __ ___
 / _` |/ _` | '_ ` _ \ / _` / __|_____ / __/ _ \| '__/ _ \
| (_| | (_| | | | | | | (_| \__ \_____| (_| (_) | | |  __/
 \__,_|\__,_|_| |_| |_|\__,_|___/      \___\___/|_|  \___|
      data management system                  core
```
damas-core is a web service back-end programmed in NodeJS. Its main features are&nbsp;:

* [JSON database model](docs/4-Specifications.md) with graph capabilities
* [Multi-user](docs/Authentication.md)
* [Server extensions](server-nodejs/extensions/)
* [Client API for Python, Javascript](docs/3-API-Reference.md), [command line](cli/) and [events](docs/Event-API.md)

[CHANGELOG](CHANGELOG.md)

# Usage
## Run using Docker
Copy the files [/docker/compose.yaml](/docker/compose.yaml), [/docker/damas.json](/docker/damas.json) and [/docker/nginx.conf](/docker/nginx.conf) from this repository and run:
```
docker compose up
```
Then in a web browser, open `http://localhost`.

##  Run from Sources
Clone this repository and run:
```
cd server-nodejs

# install dependencies
npm install

# run server
node .
```
Then in a web browser, open `http://localhost:8090`.

Read the [Installation](docs/1-Installation.md) for more details and to configure your server for your needs.

# Demo
A public demo server is available at https://demo.damas.io

# Directory Structure

<pre class="html">
📁 damas-core/
├── <a href="cli/">📁 cli/</a>                Bash + curl command line client
├── <a href="docs/">📁 docs/</a>               inline documentation
│   ├── <a href="docs/1-Installation.md">📜 1-Installation.md</a>
│   ├── <a href="docs/2-Connect.md">📜 2-Connect.md</a>
│   ├── <a href="docs/3-API-Reference.md">📜 3-API-Reference.md</a>
│   └── <a href="docs/4-Specifications.md">📜 4-Specifications.md</a>
├── 📁 docker/             deployment package
├── <a href="js/">📁 js/</a>                 Javascript client API
├── <a href="py/">📁 py/</a>                 Python client API
├── 📁 server-nodejs/      HTTP server (NodeJS/Express)
│   └── <a href="server-nodejs/extensions/">📁 extensions/</a>
├── 📁 server-tests/       server Jasmine unit tests
├── 📁 www/                served files
├── <a href="CHANGELOG.md">📜 CHANGELOG.md</a>        releases notes
├── <a href="LICENSE">📜 LICENSE</a>             GNU GPLv3 license
└── 📜 README.md           this file
</pre>

# Contributors
Remy Lalanne - Project lead  
Thibault Allard  
Julie Aresu  
Aymeric Cadier  
Sebastien Courtois  
Ghislain Dugat  
Joaquin Galvan Angeles  
Stephane Hoarau  
Matthieu Humeau  
Mathieu Lalanne  
François Morlet  
Axel Pisani  
Axel Prat  
Mathieu Valero  
Quentin Villecroze

See [Contributing](docs/Contributing.md) for coding conventions and unit testing.

# Context
`damas-core` is originaly created by [PRIMCODE](http://primcode.com) to support the production of 3D animated feature films and TV series as a digital asset manager and a universal meta data indexer (to index files, tasks, users etc) and was released as libre software in 2015 under the GNU GPLv3 license. Here is a chronology of the animated movies and TV series made using it:
- Igor - 2008 - [IMDb⤴](https://www.imdb.com/title/tt0465502/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Igor_(film))
- Tatonka - 2010-2011 [IMDb⤴](https://www.imdb.com/title/tt4446740/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Tales_of_Tatonka)
- A Monster in Paris - 2011 - [IMDb⤴](https://www.imdb.com/title/tt0961097/) [Wikipedia⤴](https://en.wikipedia.org/wiki/A_Monster_in_Paris)
- Approved for Adoption - 2012 - [IMDb⤴](https://www.imdb.com/title/tt1621766/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Approved_for_Adoption)
- Zou - 2012-2018 - [IMDb⤴](https://www.imdb.com/title/tt2587622/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Zou_(TV_series))
- Mademoiselle Zazie - 2013 - [IMDb⤴](https://www.imdb.com/title/tt3227218/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Mademoiselle_Zazie)
- Mia - 2014 - [IMDb⤴](https://www.imdb.com/title/tt4670296/)
- Zorro the Chronicles - 2015-2016 - [IMDb⤴](https://www.imdb.com/title/tt6328652/) [Wikipedia fr⤴](https://fr.wikipedia.org/wiki/Les_Chroniques_de_Zorro)
- Zombillenium - 2017 - [IMDb⤴](https://www.imdb.com/title/tt5313906/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Zombillenium)
- White-Fang - 2018 - [IMDb⤴](https://www.imdb.com/title/tt5222768/) [Wikipedia⤴](https://en.wikipedia.org/wiki/White_Fang_(2018_film))
- Gigantosaurus - 2019 - [IMDb⤴](https://www.imdb.com/title/tt9636800/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Gigantosaurus_(TV_series))
- Taffy - 2019 - [IMDb⤴](https://www.imdb.com/fr/title/tt9179928/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Taffy_(TV_series))
- Droners - 2020 - [IMDb⤴](https://www.imdb.com/title/tt14452674/)
- Nefertine on the Nile - 2021 - [IMDb⤴](https://www.imdb.com/title/tt11857654/)
- Weird Waters - 2022 - [IMDb⤴](https://www.imdb.com/title/tt16970040/)
- Heros à Moitié - 2022 - [IMDb⤴](https://www.imdb.com/title/tt22187618/)
- Hello Kitty - Super Style! - 2022 - [IMDb⤴](https://www.imdb.com/title/tt15771940/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Hello_Kitty:_Super_Style!)
- Le petit Nicolas : qu'est-ce qu'on attend pour être heureux ? - 2022 - [IMDb⤴](https://www.imdb.com/title/tt10290244/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Little_Nicholas:_Happy_As_Can_Be)
- Mars Express - 2023 - [IMDb⤴](https://www.imdb.com/title/tt26915336/) [Wikipedia fr⤴](https://fr.wikipedia.org/wiki/Mars_Express_(film))
- Angelo dans la forêt mystérieuse - 2024 - [IMDb⤴](https://www.imdb.com/title/tt23448260/) [Wikipedia fr⤴](https://fr.wikipedia.org/wiki/Angelo_dans_la_for%C3%AAt_myst%C3%A9rieuse)
- Stitch Head - 2025 - [IMDb⤴](https://www.imdb.com/title/tt26720001/) [Wikipedia⤴](https://en.wikipedia.org/wiki/Stitch_Head)
- Les Légendaires - 2025 [IMDb⤴](https://www.imdb.com/title/tt35659725/) [Wikipedia fr⤴](https://fr.wikipedia.org/wiki/Les_L%C3%A9gendaires_(film))

# Related Links
http://damas-software.org is a website which presents the projects related to damas-core  
https://syncplanet.io is a Saas using damas-core as backend  
https://hub.docker.com/r/primcode/damas-core the ready-to-install docker images  
http://dabox.io is collaborative platform for architecture using damas-core as backend  
https://github.com/PRIMCODE/damas-flow is an interface to make directed graphs on top of damas-core  
https://github.com/PRIMCODE/damas-dashboard is a web control center and admin interface to index files, in production but not packaged for distribution. Get in touch if interested  
http://primcode.com PRIMCODE is the company behind the development, the distribution and the maintenance of damas-core

# License
GPL License(GPLV3)

Copyright(c) 2026 Remy Lalanne (remy at primcode dot com)

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
