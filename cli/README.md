## Install the `damas` command on your system
Install from this repository:
```sh
cp cli/damas.sh /usr/bin/damas
```
Install from the gitHub repository:
```sh
sudo curl -L "https://raw.githubusercontent.com/remyla/damas-core/experimental/cli/damas.sh)" -o /usr/bin/damas
```
Then make the command executable:
```sh
sudo chmod +x /usr/bin/damas
```


## Manual page

```
NAME
  damas.sh - a command line interface to access a remote damas-core json storage

SYNOPSIS
  damas [OPTION...] <COMMAND> [<ARGS>]
  damas [--help] [-s|--server <server_url>] [-q|--quiet] [-v|--verbose] [-l|--lines] <COMMAND> [<ARGS>]

DESCRIPTION
  Curl-based command to expose the operations of a damas-core service.

  When ARGS is -, read standard input.

COMMANDS
  Authentication commands:
     signin    <username> <pass> or without arguments for interactive sign in
     signout   Remove authorization token

  CRUDS commands (send JSON to the server, see examples below):
     create       <json>  create node(s)
     read         <json>  show the keys of the file
     update       <json>  update nodes
     upsert       <json>  create or update nodes
     delete       <json>  delete nodes

  MORE commands
     graph        <json>  read all related nodes
     search       <query> search by query string
     search_mongo <mongo_query> <sort> <limit> <skip> MongoDB search

ENVIRONMENT VARIABLES
  DAMAS_SERVER
    URL of the server hosting damas-core. It can specify `https://` or `http://` protocols.
  DAMAS_TOKEN
    Token used for authentication.

EXAMPLES
  create an arbitrary node giving a JSON"
      damas -s yourserver create '{\"key\":\"value\",\"comment\":\"created with cli\"}'"
  list every nodes"
      damas -s yourserver search *"
  search keys matching a regular expression"
      damas -s yourserver search _id:/.*mov/"
  read nodes from a search result using a pipe"
      damas search * | damas read -"
  search deleted:true key, sort by _id key, show result as lines of ids"
      damas -s yourserver -l search_mongo '{\"deleted\":true}' '{\"_id\":1}' 0 0"

EXIT VALUES
  0  Success
  1  Syntax or usage error
  2  Not a damas repository (or any parent)
  3  Server is unreachable
  7  (Server 207) Multi-Status (some nodes do not exist)
  40 (Server 400) Bad request (not formatted correctly)
  41 (Server 401) Unauthorized
  43 (Server 403) Forbidden (the user does not have the right permission)
  44 (Server 404) Not found (all the nodes do not exist)
  49 (Server 409) Conflict (all nodes already exist with these identifiers)
  50 (Server 500) Internal server error
  60 (Server xxx) Unknown server error

FILES
  .damas/config in repository root

CREDITS
    damas.sh part of damas-core and is distributed under the GNU General Public License.
    See the file LICENSE for details.

AUTHOR
    damas.sh was originally written by Thibault Allard and is maintained by Remy Lalanne.
```
