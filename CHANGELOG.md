```
     _
  __| | __ _ _ __ ___   __ _ ___        ___ ___  _ __ ___
 / _` |/ _` | '_ ` _ \ / _` / __|_____ / __/ _ \| '__/ _ \
| (_| | (_| | | | | | | (_| \__ \_____| (_| (_) | | |  __/
 \__,_|\__,_|_| |_| |_|\__,_|___/      \___\___/|_|  \___|
```
# Changelog

## Releases

### 2025-12-29 v2.6.1
This release brings 2 new operations to retrieve an object's graph: `graph_forwards` and `graph_backwards` to parse the connected objects following the direction of the links, or in reverse. These two new operations return the identifiers of the connected links and objects (not the whole JSON objects) so you can retrieve large graphs with an optimized response size, and read the objects in the graph afterwards. The older operation named `graph` is equivalent to the new `graph_backwards` operation, but returning whole objects. The `graph` operation is kept for backward compatibility, in deprecated status. This release also fixes a bug preventing using the upsert operation under certain conditions and the doc was improved (see details below).

#### Added
* new operations: graph_forwards, graph_backwards: request the graph of the specified node(s), following the directed links or in reverse (commit #6f0b55a6)
* Javascript implementation of graph_forwards and graph_backwards in client damas.js

#### Changed
* Python client: Added back the TLS certificate verification by default (it was disabled for older `requests` module versions, thanks @Narann for the feedback. commit #b44e61c4)
* Documentation: changed links to point the inline doc instead of the github wiki, updated the description of the create operation which now returns identifiers not objects, added implementation table in api page, reworked the md and html files (commits #7b1bca05 #0aad572a)
* jwt: moved the accepted username pattern (RegExp) to configuration file. If undefined, accept all strings.

#### Fixed
* fixed a bug occuring when calling the `upsert` operation with `authorMode` enabled (when the edition permission is conditionned to the node's author key). The bug prevented from upserting correctly, so we had to fallback to a update/create scheme. (commit #8ce16917)

#### Credits
@remyla

### 2024-12-21 v2.6
This release brings performance improvement for large databases, easier container deployment with nginx in front of the API. Also, it has a small and optional change in specifications (see below), an improved documentation and 1 bugfix.

#### Added
* JWT extension: new `createToken` operation to generate API JWT keys, to use in API calls.
* The documentation is merged into this repository under the [doc/](doc) directory from the GitHub wiki repository. CHANGELOG.md was added to become less dependant on GitHub for doc.
* added GitHub actions to the repository: build and push the docker image, add clients to release assets, automate tests

#### Changed
* MongoDB driver update. MongoDB server versions 8.x are now supported using the latest MongoDB driver for NodeJS (version 6.8.0). The new driver is specified in `conf.json` by default, pointing to `db/mongodb6.js` and the legacy driver (using Mongo NodeJS driver 2.1.21) is kept under the `db/mongodb.js` for backward compatibility (it can connect to MongoDB servers up to 4.2).
* The `create` operation now returns the newly created object(s) identifier(s) and not entire object(s). ⚠️ **SPECIFICATION CHANGE** ⚠️ Retro compatibility is available using the boolean switch `conf.mongodb6.create_returns_obj` in `conf.json` (default is `false`). Tests are updated accordingly in `server-tests/2-6_spec.js`
* The Docker configuration has entirely moved into the `docker/` directory. The `docker/compose.yaml` file now runs `nginx` and the latest official MongoDB image

#### Fixed
* fixed an error produced by the ulid extension in the `create` operation when the provided `_id` were `null` values.

#### ℹ️  UPGRADE NOTES:
* Newer MongoDB version should properly load the older MongoDB database from the files on disk. If not, use:
```
# make a dump of you existing data using the --forceTableScan option
mongodump --host="<your_current_server>" --forceTableScan
# restore the dump into the new server
mongorestore --host="<your_new_server>" -d node -c node
```
* In the existing `conf.json`, upgrade to the latest MongoDB driver, switching the `db` value from `mongodb` to `mongodb6`.
* After the MongoDB migration, you can decide to use the newer specification of the `create` operation (if you are confident that you have no code on your side that is relying on the previous `create` return values, you can move to the new specifications) or you can keep the previous specification using the `conf.mongodb6.create_returns_obj` boolean switch described above
* if you encounter an issue with the upgrade, please open an issue on the damas-core GitHub repo to get some help

#### Credits
@AymericCadier (createToken), @zankia (GitHub actions), @remyla (the rest)

### 2023-04-16 v2.5
This release is a minor release (no change were made to the specifications) which contains improvements to the server, to the Python client, to the CLI and to the documentation. A new extension is added to generate ulid identifiers (see details below). The methods of the Python client module now return explicit error codes. An event listener example is provided to listen to the server events using Python and web sockets. The documentation was improved, as well as 2 bugs fixed.

Here is a more detailed list of changes:

#### Server
* ulid support (https://github.com/remyla/damas-core/wiki/Extensions#ulid)
* socket.io version updated to 4.4.0
* optimization of mongo query in search_mongo
* default now use sha1 passwords instead of md5
* in `"authorMode": true`, now users can delete their own nodes
* allow multiple node authors with array in `author` key #271
* server log format is configurable in conf.json under `morgan` key (`short`,`tiny`,`combined`,`dev` etc. see morgan module for details)
* moved older legacy code to a different branch

#### CLI
* support for server redirections
* `.sh` extension removed from the cli command
* errors are written in stderr. closes #254

#### Documentation
simplified texts of usages and documentation
* CLI usage rewrite
* Python and CLI README files
* Documentation Wiki

#### Python
* server error codes are now returned by the client's methods
* explicit server error codes returned by methods in Python client. close #244
* added a socket client example `damas_socket.py`
* new module is in `damas_client.py`, previous module moved to `damas_legacy.py`

#### Bugfixes
* upsert does not modify author. closes #256
* event are now fired before callbacks. closes #262

#### Credits
@francou (ulid), @remyla

### 2020-05-25 v2.4.1
This release provide new features and improvements for user management, new features for security and changes in command line interface, along with 2 bug fixes in cli.

#### user management, authentication and security improvements
*  server-nodejs : user node structure changed
* server-nodejs : authenticate users using a remote server
* server-nodejs / jwt : signIn with email
* server-nodejs / jwt : specify token lifespan at signIn
* server-nodejs / jwt : per user unique salt
* server-nodejs : auto-switch between md5/sha1
* server-nodejs : store user last activity time
* server-nodejs : moved dam operations to an extension
* server-nodejs : user accounts can be disabled
* server-nodejs : handle JSON parsing errors, return 400

#### command line interface improvements
* cli: remove file management commands from damas cli
* cli: add –server long option
* cli: updated help
* cli: make search for .damas/config optional
* cli: support for simultaneous connections (unique token for each conn) 

####  bug fixes
* cli: regression found for option -l and arrays of strings
* cli: fix in stdin argument switch

####   doc
* wiki specifications / API reference improvements
* repository README.md improvements
* html / css improvements

#### Credits
Axel Pisani @axl-pis, Remy Lalanne @remyla

### 2019-05-24 v2.4
This release adds an extension system to change the server behavior by loading and configuring extensions from its configuration file. A lot of code has been rewritten as extensions (see [server extensions page](https://github.com/remyla/damas-core/wiki/Extensions)). Also, the efforts were made to get a server that can be used as a public web server (able to serve files, manage guest access and node-based permissions).

#### Features
* new extension system to write and add functionalities to extend the server #164  [server extensions](https://github.com/remyla/damas-core/wiki/Extensions)
* new optional permission rule using node's `author` key (to prevent users from reading or updating other users nodes) #189
* new option to allow guest access while authentication is enabled #147
* new extension to define static routes to serve files #172
* command line interface now accepts environment variables #194
* new operation `upsert` in API: update nodes or create nodes if they don't exist yet #155
* support for older NodeJS versions (< ES6) #195
* support for options in regular expressions to allow case insensitive search #86

#### Documentation
* documentation about the [server extensions](https://github.com/remyla/damas-core/wiki/Extensions) #188

#### Credits
* Thibault Allard @zankia
* Julie Aresu @juliearesu
* Remy Lalanne @remyla


### 2017-06-01 v2.3.6
#### Changes
##### Command line interface
* damas-cli improved (#125 #149 #150 #151 #157 #158 #168 )

##### Specifications
* specifications improved, multiple inputs per request and returned values (#106 #114 #122 #181)
>  (see «specifications» wiki page)

##### server-nodejs
* features: regexp option search, server signal handling, server extensions
* introduction to author-based permissions
* bug fixes (#156 #166)

_for a complete list of changes please see Github `2.3.6` milestone tagged issues_

#### Credits
@juliearesu @zankia @remyla
Thank you @juliearesu and @zankia!

### 2016-11-01 v2.3.5
retro tagging for November 2016 stable. Improvements made to the server-nodejs:

* implementation of class-based permissions (#66)
* CRUD operations accept arrays to process multiple nodes per request (See «specifications» page in Wiki)
* event layer and support for connections through web sockets (not used in production yet though)
* bug fixes (key types, server limits)

### 2015-04-07 v2.3.0
The release contains the evolutions from 2014 and is considered as the latest stable. However the Python module is not updated yet. This version is prior to the new implementations we will make during spring 2015.

#### Changes
- CRUDs operations convention implemented strictly:
  - create, read, update, delete, search
  - REST operations and API methods renamed
- The user authentication scheme is updated
  - passwords are stored as sha1 keys on user nodes
- Removed the MySQL 'type' field in the node table - we use a generic 'type' key
  - types are now defined using regular keys (therefore update-able using the update method)
  - removed deprecated setType() function
  - updated message scheme: messages now have a type=message key
  - updated assets: assets now have a type=asset key
- New search method
  - supports this new operators: =, !=, <, >, <=, .=>, LIKE, BETWEEN...AND, REGEXP
  - operators are placed before the value to test { 'keyname': 'operator value' }
  - example of a search pattern { 'type':'=message', 'time':'>1428366657' } to search messages after Apr 7 2015 

### 2015-02-14 v2.2.0
This version is the latest production ready version at that time.

We are already working on the next 2.3.x version (branch 2014) with an updated API, so this should be the latest 2.2.x release appart from bug fixes and minor changes.

The 2014 branch (pre-production) will now be merge to the master branch.

#### Migration of a database from 2.1 to 2.2

_(sorry for the french language, this is temporary, please ask for translation if needed)_
Requête permettant de sélectionner tout les fils et leurs parents et de les mettre dans la table KEY :

```sql
REPLACE INTO `key`(`node_id`, `name`, `value`) SELECT id,"#parent", parent_id FROM node;
```

Requête permettant la vérification de la présence de tout les fils et leurs parents sur la nouvelle table: (La requête renvoie le tableau des occurrences non trouvées dans la nouvelle table et ne renvoie rien si tout y est.)

```sql
SELECT ID, PARENT_ID FROM NODE WHERE (ID, PARENT_ID) NOT IN (SELECT ID, `VALUE` FROM NODE, `KEY` WHERE NAME="#parent" AND ID = NODE_ID);
```

Requête permettant la suppression de la colonne "parent_id" sur la table node:

```sql
ALTER TABLE node DROP COLUMN parent_id;
```

### 2015-02-14 v2.1-stable
This version is ran at Cyber Group Studios in production. This human-readable changelog is started from now, along with the distribution of the source code as Free software.
