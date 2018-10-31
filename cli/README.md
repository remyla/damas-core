```
NAME
  damas.sh - a command line interface for digital asset management

SYNOPSIS
  damas [OPTION...] <command> [<args>]
  damas [--help] [-q|--quiet] [-v|--verbose] [-l|--lines] <command> [<args>]

DESCRIPTION
  curl-based command to expose the operations of a damas-core service and manage a local repository filesystem

COMMANDS
  File commands:
     add       Add files to the index
     init      Prepare the current directory adding a .damas/ repo folder
     lock      Lock files (set key 'lock' = user name)
     rm        Remove files from the index
     show      Show files records
     signin    <username> <pass>
     signout   Remove authorization token
     stats     Update file_mtime and file_size keys of files
     unlock    Unlock files
     untracked List untracked files"
     
  CRUDS commands (send JSON to the server, see examples below):
     create       <json>  create node(s)
     read         <json>  show the keys of the file
     update       <json>  update nodes
     upsert       <json>  create or update nodes
     delete       <json>  delete nodes
     search       <query> search

  MORE commands
     comment      <json>  create child node
     graph        <json>  read all related nodes     
     search_mongo <query> <sort> <limit> <skip> MongoDB search - beta

ENVIRONMENT VARIABLES
  DAMAS_DIR
    Path to the repository. It can be an absolute path or relative path to current working directory.
  DAMAS_SERVER
    URL of the server hosting damas-core. It can specify `https://` or `http://` protocols.
  DAMAS_TOKEN
    Token used for authentication.

EXAMPLES
  start tracking every files in current directory
      damas add *
  create an arbitrary node giving a JSON
      damas create '{\"#parent\":\"value\",\"comment\":\"created with cli\"}'
  read nodes for every file in the current directory
      damas show *
  search keys matching a regular expression
      damas search _id:/.*mov/
  search deleted:true key, sort by _id key, show result as lines of ids
      damas -l search_mongo '{"deleted":true}' '{"_id":1}' 0 0

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
