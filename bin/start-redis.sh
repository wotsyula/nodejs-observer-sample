#!/bin/sh

# Functions -------------------------------------------------------------------

# Following regex is based on https://www.rfc-editor.org/rfc/rfc3986#appendix-B with
# additional sub-expressions to split authority into userinfo, host and port
#
readonly URI_REGEX='^(([^:/?#]+):)?(//((([^:/?#]+)@)?([^:/?#]+)(:([0-9]+))?))?(/([^?#]*))(\?([^#]*))?(#(.*))?'
#                    ↑↑            ↑  ↑↑↑            ↑         ↑ ↑            ↑ ↑        ↑  ↑        ↑ ↑
#                    |2 scheme     |  ||6 userinfo   7 host    | 9 port       | 11 rpath |  13 query | 15 fragment
#                    1 scheme:     |  |5 userinfo@             8 :…           10 path    12 ?…       14 #…
#                                  |  4 authority
#                                  3 //…

parse_port () {
  [[ "$1" =~ $URI_REGEX ]] && echo "${BASH_REMATCH[9]:-6379}"
}

# Configuration ---------------------------------------------------------------

ROOT_DIRECTORY=$(dirname $(dirname ${BASH_SOURCE[0]:-$0}))
ROOT_DIRECTORY=$(realpath $ROOT_DIRECTORY)
REDIS_DIRECTORY="$ROOT_DIRECTORY/vendor/redis-stable"
ENV_FILE="$ROOT_DIRECTORY/.env"
CFG_FILE="$ROOT_DIRECTORY/config/redis.conf"

if [ -r $ENV_FILE ]; then
  source $ENV_FILE
fi

REDIS_SERVER="src/redis-server"
REDIS_PORT=$(parse_port $DB_URI)

# Run -------------------------------------------------------------------------

cd $REDIS_DIRECTORY

if [ -x $REDIS_SERVER ]; then
  $REDIS_SERVER --port $REDIS_PORT
else
  echo "$REDIS_SERVER is not readable or does not exist"
fi
