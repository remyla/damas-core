#!/bin/bash
#
# Shell methods for DAMAS software (damas-software.org)
#
# This file is part of damas-core.
#
# damas-core is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# damas-core is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
# for more details.
#
# You should have received a copy of the GNU General Public License along
# with damas-core.  If not, see <http://www.gnu.org/licenses/>.

# VARIABLES
USER=`whoami`
CURL_ARGS='-ksL -w "\n%{http_code}" -H "Content-Type: application/json"'
BUFFER_SIZE=1000

# map errors sent by the server
map_server_errors() {
  case $1 in
    200) # OK
      exit 0
      ;;
    201) # OK (object(s) created)
      exit 0
      ;;
    000) # Server unreachable
      echo "Server '$DAMAS_SERVER' is unreachable" >&2
      exit 3
      ;;
    207) # Multi-Status (some objects do not exist)
      echo "Multi-Status (some objects do not exist) (server error 207)" >&2
      exit 7
      ;;
    400) # Bad request (not formatted correctly)
      echo "Bad request (not formatted correctly) (server error 400)" >&2
      exit 40
      ;;
    401) # Unauthorized
      echo "Unauthorized (server error 401)" >&2
      exit 41
      ;;
    403) # Forbidden (the user does not have the right permission)
      echo "Forbidden (the user does not have the right permission) (server error 403)" >&2
      exit 43
      ;;
    404) # Not found (all the objects do not exist)
      echo "Not found (all the objects do not exist) (server error 404)" >&2
      exit 44
      ;;
    409) # Conflict (all objects already exist with these identifiers)
      echo "Conflict (all objects already exist with these identifiers) (server error 409)" >&2
      exit 49
      ;;
    500) # Internal server error
      echo "Internal server error (server error 500)" >&2
      exit 50
      ;;
    *)   # Unknown server error
      echo "Unknown server error" >&2
      exit 60
      ;;
  esac
}

run() {
  if [ $VERBOSE ]; then
    echo "$1"
  fi
  RES=$(eval "$1")
  if [ ! $QUIET ]; then
    if [ $LINESOUT ]; then
      #printf "$(echo "$RES" | sed '$d' | sed 's/.*\["\(.*\)"\].*/\1/g' | sed 's/\",\"/\n/g')\n"
      # attempt that introduced a regression
      printf "$(echo "$RES" | sed '$d' | sed 's/^\[//g' | sed 's/\]$//g' | sed 's/},{/}\n{/g' | sed 's/\",\"/\"\n\"/g')\n"
      # fixed lines
    else
      echo "$RES" | sed '$d' | grep -v "^$"
    fi
  fi
  map_server_errors "${RES##*$'\n'}"
}

load_token() {
  if [ $DAMAS_TOKEN ]; then
    local TOKEN=$DAMAS_TOKEN
  else
    local TOKEN_FILE="/tmp/damas-$USER-$(echo -n $DAMAS_SERVER | cksum | head -c 10)"
    local TOKEN=$(cat $TOKEN_FILE 2> /dev/null)
  fi

  AUTH='-H "Authorization: Bearer '$TOKEN'"'
}

show_help_msg() {
  echo "usage: damas [--help] [-s|--server <server_url>] [-q|--quiet] [-v|--verbose] [-l|--lines] <COMMAND> [<ARGS>]"
  echo ""
  echo "When ARGS is -, read standard input."
  echo ""
  echo "Authentication commands: "
  echo "   signin    <username> <pass> or without arguments for interactive sign in"
  echo "   signout   Remove authorization token"
  echo ""
  echo "CRUDS commands (send JSON to the server, see examples below):"
  echo "   create       <json>  insert object(s)"
  echo "   read         <json>  retrieve object(s) keys"
  echo "   update       <json>  modify object(s) keys"
  echo "   upsert       <json>  insert and modify object(s)"
  echo "   delete       <json>  remove object(s)"
  echo ""
  echo "MORE commands"
  echo "   graph        <json>  retrieve related nodes and edges"
  echo "   search       <query> search by query string"
  echo "   search_mongo <query> <sort> <limit> <skip> MongoDB search"
  echo ""
  echo "ENVIRONMENT VARIABLES"
  echo "  DAMAS_SERVER"
  echo "    URL of the server hosting damas-core. It can specify https:// or http:// protocols."
  echo "  DAMAS_TOKEN"
  echo "    Token used for authentication."
  echo ""
  echo "EXAMPLES"
  echo "    insert an arbitrary object giving a JSON"
  echo "        damas -s yourserver create '{\"key\":\"value\",\"comment\":\"created with cli\"}'"
  echo "    list every objects"
  echo "        damas -s yourserver search *"
  echo "    retrieve an object"
  echo "        damas -s yourserver read '\"object_id\"'"
  echo "    retrieve multiple objects"
  echo "        damas -s yourserver read '[\"object_id1\",\"object_id2\"]'"
  echo "    search keys matching a regular expression"
  echo "        damas -s yourserver search _id:/.*mov/"
  echo "    read objects from a search result using a pipe"
  echo "        damas -s yourserver search * | damas read -"
  echo "    search deleted:true key, sort by _id key, show result as lines of ids"
  echo "        damas -s yourserver -l search_mongo '{\"deleted\":true}' '{\"_id\":1}' 0 0"
  echo ""
  echo "EXIT VALUES"
  echo "  0  Success"
  echo "  1  Syntax or usage error"
  echo "  2  Not a damas repository (or any parent)"
  echo "  3  Server is unreachable"
  echo "  7  (Server 207) Multi-Status (some objects do not exist)"
  echo "  40 (Server 400) Bad request (not formatted correctly)"
  echo "  41 (Server 401) Unauthorized"
  echo "  43 (Server 403) Forbidden (the user does not have the right permission)"
  echo "  44 (Server 404) Not found (all objects do not exist)"
  echo "  49 (Server 409) Conflict (all objects already exist with these identifiers)"
  echo "  50 (Server 500) Internal server error"
  echo "  60 (Server xxx) Unknown server error"
  echo ""
  echo "FILES"
  echo "  /tmp/damas-<username>-<signature> tokens issued at signin"
  exit 0
}

# loop through arguments
while true; do
  case "$1" in
    -h)
      echo "usage: damas [--help] <command> [<args>]"
      exit 0
      ;;
    --help)
      show_help_msg
      ;;
    -v | --verbose)
      VERBOSE=true
      CURL_VERBOSE="-v"
      shift 1
      ;;
    -q | --quiet)
      QUIET=true
      shift 1
      ;;
    -l | --lines)
      LINESOUT=true
      shift 1
      ;;
    -s | --server)
      DAMAS_SERVER=$2
      shift 2
      ;;
    -*)
      echo "Unknown option: $1"
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

COMMAND=$1
shift

if [ -z "$COMMAND" ]; then
  echo "damas: missing command"
  show_help_msg
  exit 1
fi

if [ ! -t 0 -a $# -eq 0 ]; then
  #run this script for input stream
  xargs -n $BUFFER_SIZE $0 $COMMAND
  exit $?
fi

load_token

if [ "$1" == "-" ]; then
  DATA=@/dev/stdin 
else
  DATA=$*
fi

case $COMMAND in
  create)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -d '$DATA' ${DAMAS_SERVER}/api/create/"
    ;;
  read)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -d '$DATA' ${DAMAS_SERVER}/api/read/"
    ;;
  update)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -X PUT -d '$DATA' ${DAMAS_SERVER}/api/update/"
    ;;
  upsert)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -d '$DATA' ${DAMAS_SERVER}/api/upsert/"
    ;;
  delete)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -X DELETE -d '$DATA' ${DAMAS_SERVER}/api/delete/"
    ;;
  graph)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -d '$DATA' ${DAMAS_SERVER}/api/graph/0/"
    ;;
  search)
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH ${DAMAS_SERVER}/api/search/$1"
    ;;
  search_mongo)
    QUERY='{"query": '$1', "sort": '$2', "limit": '$3', "skip": '$4'}'
    run "curl $CURL_VERBOSE $CURL_ARGS $AUTH -X POST ${DAMAS_SERVER}/api/search_mongo/ -d '$QUERY'"
    ;;
  signin)
    if [ $VERBOSE ]; then
      echo "$1"
    fi
    USERN=$1
    PASS=$2
    if [ $3 ]; then
      expiresIn="&expiresIn=$3"
    else
      expiresIn=""
    fi
    if [ -z $USERN ]; then
      read -p "login: " USERN
    fi
    if [ -z $PASS ]; then
      read -sp "password: " PASS
      printf "\n\n"
    fi
    RES=$(eval "curl $CURL_VERBOSE -ks -w \"\n%{http_code}\" --fail -d 'username=$USERN&password=${PASS}${expiresIn}' ${DAMAS_SERVER}/api/signIn/")
    TOKEN=$(echo $RES| sed 's/^.*"token":"\([^"]*\)".*$/\1/')
    TOKEN_FILE="/tmp/damas-$USER-$(echo -n $DAMAS_SERVER | cksum | head -c 10)"
    echo $TOKEN
    echo $TOKEN > $TOKEN_FILE
    chmod go-rw "$TOKEN_FILE"
    map_server_errors "${RES##*$'\n'}"
    ;;
  signout)
    TOKEN_FILE="/tmp/damas-$USER-$(echo -n $DAMAS_SERVER | cksum | head -c 10)"
    rm "$TOKEN_FILE"
    exit 0
    ;;
  *)
    echo "damas: invalid command '$COMMAND'" >&2
    show_help_msg
    exit 1
    ;;
esac
