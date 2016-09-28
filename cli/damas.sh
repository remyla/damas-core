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
JSON="Content-Type: application/json"

# FUNCTIONS
damas_create() {
  RES=$(curl -ks -H "$AUTH" -H "$JSON" -d "$*" $URL'create/')
  if [ $HUMAN ]; then
    parse_json "$RES"
    RES=$PARSED
  fi
}

damas_add() {
  get_ids $@
  RES=$(curl -ks -H "$AUTH" -H "$JSON" \
    -d '{"_id": '"$IDS$JSONARG"'}' $URL'create/')
  if [ $HUMAN ]; then
    parse_json "$RES"
    RES=$PARSED
  fi
}

damas_read() {
  get_ids $@
  RES=$(curl -ks -H "$AUTH" -H "$JSON" -d "$IDS" $URL'read/')
  if [ $HUMAN ]; then
    parse_json "$RES"
    RES=$PARSED
  fi
}

damas_update() {
  RES=$(curl -ks -X PUT -H "$AUTH" -H "$JSON" -d "$*" $URL'update/')
  if [ $HUMAN ]; then
    parse_json "$RES"
    RES=$PARSED
  fi
}

damas_remove() {
  get_ids $@
  RES=$(curl -ks -X DELETE -H "$AUTH" -H "$JSON" -d "$IDS" $URL'delete/')
}

damas_search() {
  RES=$(curl -ks -H "$AUTH" $URL'search/'$1)
}

damas_search_mongo() {
  RES=$(curl -ks -H "$AUTH" -H "$JSON" $URL'search_mongo/' \
    -d '{"query": "'$1'", "sort": "'$2'", "limit": "'$3'", "skip": "'$4'"}')
}

damas_write() {
  if [ ! -n "$COMMARG" ]; then
    read -p "messsage: " COMMARG
  fi
  RES=
  for id in $@; do
    get_real_path $id
    RES=$RES$(curl -ks -H "$AUTH" -H "$JSON" \
      -d '{"comment": "'"$COMMARG"'", "#parent": "'$FILEPATH'"}' \
      $URL'create/')","
  done
  RES='['${RES:0:-2}'}]'
  if [ $HUMAN ]; then
    parse_log "$RES"
    RES=$PARSED
  fi
}

damas_link() {
  RES=
  ERRORS=
  get_real_path $1
  TARGET=$FILEPATH
  shift
  for id in $@; do
    get_real_path $id
    KNOWN=$(curl -ks -H "$AUTH" -H "$JSON" \
      $URL'search/src_id:'"$FILEPATH"'%20tgt_id:'"$TARGET")
    if [[ "[]" == "$KNOWN" ]]; then
      RES=$RES$(curl -ks -H "$AUTH" -H "$JSON" \
        -d '{"src_id": "'"$FILEPATH"'", "tgt_id": "'"$TARGET"'"'"$JSONARG"'}' \
        $URL'create/')","
    else
      ERRORS=$ERRORS"\nLink $FILEPATH -> $TARGET already exists"
    fi
  done;
  if [  -n "$RES" ]; then
    RES='['${RES:0:-2}'}]'
    if [ $HUMAN ]; then
      parse_json "$RES"
      RES=$PARSED
    fi
  fi
  RES=$RES$ERRORS
}

damas_log() {
  RESPONSE=
  ERRORS=
  for id in $@; do
    get_real_path $id
    damas_search "%23parent:$FILEPATH"
    RESULT=$(curl -ks -H "$AUTH" -H "$JSON" -d "$RES" $URL'read/')","
    if [[ $RESULT == \[* ]]; then
      RESPONSE=$RESPONSE$RESULT
    else
      ERRORS=$ERRORS"\nNo entry found for $FILEPATH"
    fi
  done
  if [  -n "$RESPONSE" ]; then
    RESPONSE=${RESPONSE:0:-2}']'
    if [ $HUMAN ]; then
      parse_log "$RESPONSE"
      RESPONSE=$PARSED
    fi
  fi
  RES=$RESPONSE$ERRORS
}

damas_graph() {
  get_ids $@
  RES=$(curl -ks -H "$AUTH" -H "$JSON" -d "$IDS" $URL'graph/')
  if [ $HUMAN ]; then
    parse_json "$RES"
    RES=$PARSED
  fi
}

damas_lock() {
  get_ids $@
  RES=$(curl -ks -X PUT -H "$AUTH" -H "$JSON" -d "$IDS" $URL'lock/')
}

damas_unlock() {
  get_ids $@
  RES=$(curl -ks -X PUT -H "$AUTH" -H "$JSON" -d "$IDS" $URL'unlock/')
}

damas_version() {
  for id in $@; do
    get_real_path $id
    RES=$(curl -ks -H "$AUTH" -H "$JSON" -d "$JSONARG" $URL'version/'$FILEPATH)
  done
}

damas_signin() {
  TOKEN=$(curl -ks --fail -d "username=$1&password=$2" $URL'signIn' \
    | sed 's/^.*"token":"\([^"]*\)".*$/\1/')
  echo $TOKEN > "/tmp/damas-$USER"
  chmod go-rw "/tmp/damas-$USER"
}

damas_signout() {
  rm "/tmp/damas-$USER"
}

parse_json() {
  PARSED=$(sed 's/[]{}"\[]//g' <<< $1 \
    | awk '{n=split($0,key,","); for (i=1; i<=n; ++i) print key[i]}' \
    | sed 's/^\([^_id:]\)/    \1/' | sed 's/^_id://')
}

parse_log() {
  PARSED=$(sed 's/^\[{\|}]$//g' <<< $1 \
    | awk '{n=split($0,key,"},{|}],\\[{"); for (i=1; i<=n; ++i) print key[i]}' \
    | while read l; do \
      m=$(echo "$l" | sed 's/.*"time":\([^"]*\).*/\1/')
      m=$(date -d @${m:0:-3} +"%b %d %Y %R%t")
      n=$(echo "$l" | sed 's/\("_id":"\|"#parent":"\|"time":\)[^"]*\|"//g' \
        | sed 's/,/ /g')
      echo "$m$n"
    done)
}

get_ids() {
  IDS='['
  for id in "$@"; do
    get_real_path $id
     IDS=$IDS'"'$FILEPATH'", '
  done
  IDS=${IDS:0:-2}']'
}

get_real_path() {
  FILEPATH="/"$(realpath --relative-base $DIRECTORY $1 | sed 's/\.$//')
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
  echo "Error: You're not in a damas subdirectory" >&2
  exit 1
}

auth() {
  local TOKEN=$(cat /tmp/damas-$USER 2> /dev/null)
  AUTH="Authorization: Bearer $TOKEN"
  VERIF=$(curl -ks -o /dev/null -w '%{http_code}' -H "$AUTH" $URL'verify/')
  if [ "401" == $VERIF ]; then
    TOKEN=
    while [ ! -n "$TOKEN" ]; do
      echo "Please identify yourself"
      read -p "login: " USERN
      read -s -p "password: " PASS
      damas_signin $USERN $PASS
      printf "\n\n"
    done
    AUTH="Authorization: Bearer $TOKEN"
  elif [ "000" == $VERIF ]; then
    echo "damas: server unreachable"
    exit 3
  fi
}

show_help_msg() {
  echo "Try 'damas --help' for more information."
}


# MAIN
ACTION=$1
shift

case $ACTION in
    -h)
      echo "usage: damas <operation>"
      exit 1
      ;;

    --help)
      echo "    add"
      echo "        [-h] [-j <json>] <file>"
      echo "        create a new node for the specified file"
      echo "    read"
      echo "        [-h] <file>"
      echo "        show the keys of the file"
      echo "    update"
      echo "        [-h] <full-json>"
      echo "        update nodes"
      echo "    remove"
      echo "        <file>"
      echo "        delete the node of the specified file"
      echo "    search"
      echo "        <query>"
      echo "        search"
      echo "    search_mongo"
      echo "        <query> <sort> <limit> <skip>"
      echo "        search with MongoDB parameters"
      echo "    write"
      echo "        [-h] [-m <comment>] <file>"
      echo "        write a message node on a file"
      echo "    log"
      echo "        [-h] <file>"
      echo "        show history of file (children nodes)"
      echo "    graph"
      echo "        [-h] <file>"
      echo "        show all files and links related"
      echo "    lock"
      echo "        <file>"
      echo "        lock a file"
      echo "    unlock"
      echo "        <file>"
      echo "        unlock a file"
      echo "    version"
      echo "        -j <json> <file>"
      echo "        set a new version of a file"
      echo "    signin"
      echo "        <username> <pass>"
      echo "        set the authorization token"
      echo "    signout"
      echo "        remove authorization token"
      echo "    init"
      echo "        make your directory and subdirectories available for damas"
      exit 0
      ;;

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

# loop through arguments
while true; do
  case "$1" in
    -j | --json)
      JSONARG=", "$2
      shift 2
      ;;

    -m | --messsage)
      COMMARG=$2
      shift 2
      ;;

    -h | --human)
      HUMAN=true
      shift 1
      ;;

    -*)
      echo "damas: invalid argument '$1'"
      exit 1
      ;;

    *)
      break
      ;;
  esac
done

# Verify if in a .damas directory
upsearch '.damas'
CONFIG=$DIRECTORY'/.damas/config'
if [ ! -f $CONFIG ]; then
    echo "config file does not exist. Creating one.."
    echo 'URL="http://localhost:8090/api/"' > $CONFIG
fi
source $CONFIG

# main operation
if [ ! -n "$ACTION" ]; then
  echo "damas: missing operation"
  show_help_msg
  exit 2
fi

case $ACTION in
    create)
      auth
      damas_create $@
      ;;
    add)
      auth
      damas_add $@
      ;;

    read)
      auth
      damas_read $@
      ;;

    update)
      auth
      damas_update $@
      ;;

    remove)
      auth
      damas_remove $@
      ;;

    search)
      auth
      damas_search $@
      ;;

    search_mongo)
      auth
      damas_search_mongo $@
      ;;

    write)
      auth
      damas_write $@
      ;;

    link)
      auth
      damas_link $@
      ;;

    log)
      auth
      damas_log $@
      ;;

    graph)
      auth
      damas_graph $@
      ;;

    lock)
      auth
      damas_lock $@
      ;;

    unlock)
      auth
      damas_unlock $@
      ;;

    version)
      auth
      damas_version $@
      ;;

    signin)
      damas_signin $1 $2
      if [ ! -n $TOKEN ]; then
        exit 2
      fi
      exit 0
      ;;

    signout)
      damas_signout
      exit 0
      ;;

    *)
      echo "damas: invalid operation '$ACTION'" >&2
      show_help_msg
      exit 1
      ;;

esac

echo -e "$RES"
