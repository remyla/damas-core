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
CURL_ARGS='-ks -w "\n%{http_code}" -H "Content-Type: application/json"'
BUFFER_SIZE=1000

# map errors sent by the server
map_server_errors() {
    case $1 in
        200) # OK
            exit 0
            ;;
        201) # OK (node(s) created)
            exit 0
            ;;
        000) # Server unreachable
            exit 3
            ;;
        207) # Multi-Status (some nodes do not exist)
            exit 7
            ;;
        400) # Bad request (not formatted correctly)
            exit 40
            ;;
        401) # Unauthorized
            exit 41
            ;;
        403) # Forbidden (the user does not have the right permission)
            exit 43
            ;;
        404) # Not found (all the nodes do not exist)
            exit 44
            ;;
        409) # Conflict (all nodes already exist with these identifiers)
            exit 49
            ;;
        500) # Internal server error
            exit 50
            ;;
        *)   # Unknown server error
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
    echo $(echo "$RES" | sed '$d')
  fi
  map_server_errors "${RES##*$'\n'}"
}

get_ids() {
  if [ $# -eq 0 ]; then
    echo "damas: missing file argument"
    show_help_msg
    exit 1
  fi
  IDS='['
  for id in "$@"; do
    get_real_path $id
    IDS=$IDS'"'$FILEPATH'",'
  done
  IDS=${IDS:0:-1}']'
}

get_real_path() {
  FILEPATH=$(realpath -m --relative-base $DIRECTORY $1 | sed 's/\.$//')
  if [[ $FILEPATH != /* ]]; then
    FILEPATH="/"$FILEPATH
  fi
  if [ -d "$1" ]
  then
    FILEPATH=$FILEPATH'/'
  fi
}

upsearch() {
  local SLASHES=${PWD//[^\/]/}
  DIRECTORY="$PWD"
  for (( n=${#SLASHES}; n>0; --n )); do
    test -e "$DIRECTORY/$1" && return
    DIRECTORY="$DIRECTORY/.."
  done
  echo "Error: Not a damas repository (or any parent)" >&2
  exit 2
}

load_token() {
  local TOKEN=$(cat /tmp/damas-$USER 2> /dev/null)
  AUTH='-H "Authorization: Bearer '$TOKEN'"'
}

show_help_msg() {
  echo "usage: damas [--help] [-q|--quiet] [-v|--verbose] <command> [<args>]"
  echo ""
  echo "File commands: "
  echo "   add       Add files to the index"
  echo "   init      Prepare the current directory adding a .damas/ repo folder"
  echo "   lock      Lock files (set key 'lock' = user name)"
  echo "   rm        Remove files from the index"
  echo "   show      Show files record"
  echo "   untracked List untracked files"
  echo "   signin    <username> <pass>"
  echo "   signout   Remove authorization token"
  echo "   stats     Update file_mtime and file_size keys of files"
  echo "   unlock    Unlock files"
  echo ""
  echo "CRUDS commands (send JSON to the server, see examples below):"
  echo "   create       <json>  create node(s)"
  echo "   read         <json>  show the keys of the file"
  echo "   update       <json>  update nodes"
  echo "   delete       <json>  delete nodes"
  echo "   search       <query> search"
  echo "   search_mongo <query> <sort> <limit> <skip> MongoDB search - beta"
  echo "   comment      <json>  create child node"
  echo ""
  echo "EXAMPLES"
  echo ""
  echo "    start tracking every files in current directory"
  echo "        damas add *"
  echo ""
  echo "    create an arbitrary node giving a JSON"
  echo "        damas create '{\"#parent\":\"value\",\"comment\":\"created with cli\"}'"
  echo ""
  echo "    read nodes for every file in the current directory"
  echo "        damas show *"
  echo ""
  echo "    search keys matching a regular expression"
  echo "        damas search _id:/.*mov/"
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
      shift 1
      ;;
    -q | --quiet)
      QUIET=true
      shift 1
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

case $COMMAND in
    init)
      read -p "remote URL (default = localhost:8090): " URL
      if [  -z $URL ]; then
        URL='localhost:8090'
      fi
      mkdir '.damas'
      echo 'URL="http://'$URL'/api/"' > '.damas/config'
      echo 'Initialized empty Damas repository in '$(realpath .) \
        '/.damas/ with remote http://'$URL'/api/'
      exit 0
      ;;
esac

# Verify if in a .damas directory
upsearch '.damas'
DIRECTORY=$(realpath $DIRECTORY)
CONFIG=$DIRECTORY'/.damas/config'
if [ ! -f $CONFIG ]; then
    echo "config file does not exist. Creating one.."
    echo 'URL="http://localhost:8090/api/"' > $CONFIG
fi
source $CONFIG

load_token

case $COMMAND in
    create)
      run "curl $CURL_ARGS $AUTH -d '$*' ${URL}create/"
      ;;
    read)
      run "curl $CURL_ARGS $AUTH -d '$*' ${URL}read/"
      ;;
    update)
      run "curl $CURL_ARGS $AUTH -X PUT -d '$*' ${URL}update/"
      ;;
    delete)
      run "curl $CURL_ARGS $AUTH -X DELETE -d '$*' ${URL}delete/"
      ;;
    search)
      run "curl $CURL_ARGS $AUTH ${URL}search/$1"
      ;;
    add)
      get_ids $@
      run "curl $CURL_ARGS $AUTH -d '{\"_id\":$IDS}' ${URL}create/"
      ;;
    show)
      get_ids $@
      run "curl $CURL_ARGS $AUTH -d '$IDS' ${URL}read/"
      ;;
    untracked)
      BASE="/tmp/damas-files_"
      find $PWD$1 -type f > ${BASE}origin
      echo -n '[' > ${BASE}request
      while read file; do
        FILEPATH=${file#"$DIRECTORY"}
        echo -n '"'$FILEPATH'",' >> ${BASE}request
      done < ${BASE}origin
      echo -n '""]' >> ${BASE}request
      eval "curl $CURL_ARGS $AUTH -d "@${BASE}request" ${URL}read/" > ${BASE}response
      STATUS=$(sed '$!d' ${BASE}response);
      if [ $STATUS  -gt 300 ]; then
        head -n 1 ${BASE}response
        map_server_errors $STATUS
      fi
      sed -e $'s/\([^"]\),/\\1\\n/g' ${BASE}response | grep -n null | \
          cut -f1 -d: > ${BASE}result
      while read l; do
        sed "${l}q;d" ${BASE}origin
      done < ${BASE}result
      rm ${BASE}*
      ;;
    stats)
      get_ids $@
      bytes=`stat -c%s "$1"`
      mtime=`stat -c%Y "$1"`000
      run "curl $CURL_ARGS $AUTH -X PUT -d '{\"_id\":$IDS,\"file_size\":$bytes,\"file_mtime\":$mtime}' ${URL}update/"
      ;;
    rm)
      get_ids $@
      run "curl $CURL_ARGS $AUTH -X DELETE -d '$IDS' ${URL}delete/"
      ;;
    search_mongo)
      QUERY='{"query": '$1', "sort": '$2', "limit": '$3', "skip": '$4'}'
      run "curl $CURL_ARGS $AUTH -X POST ${URL}search_mongo/ -d '$QUERY'"
      ;;
    lock)
      get_ids $@
      run "curl $CURL_ARGS $AUTH -X PUT -d '$IDS' ${URL}lock/"
      ;;
    unlock)
      get_ids $@
      run "curl $CURL_ARGS $AUTH -X PUT -d '$IDS' ${URL}unlock/"
      ;;
    comment)
      run "curl $CURL_ARGS $AUTH -d '$*' ${URL}comment/"
      ;;
    signin)
      if [ $VERBOSE ]; then
        echo "$1"
      fi
      USERN=$1
      PASS=$2
      if [ -z $USERN ]; then
        read -p "login: " USERN
      fi
      if [ -z $PASS ]; then
        read -sp "password: " PASS
        printf "\n\n"
      fi
      RES=$(eval "curl -ks -w \"\n%{http_code}\" --fail -d 'username=$USERN&password=$PASS' ${URL}signIn")
      TOKEN=$(echo $RES| sed 's/^.*"token":"\([^"]*\)".*$/\1/')
      echo $TOKEN
      echo $TOKEN > "/tmp/damas-$USER"
      chmod go-rw "/tmp/damas-$USER"
      map_server_errors "${RES##*$'\n'}"
      ;;
    signout)
      rm "/tmp/damas-$USER"
      exit 0
      ;;
    *)
      echo "damas: invalid command '$COMMAND'" >&2
      show_help_msg
      exit 1
      ;;
esac
