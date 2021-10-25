#!/bin/sh

# Configuration ---------------------------------------------------------------

ROOT_DIRECTORY=$(dirname $(dirname ${BASH_SOURCE[0]:-$0}))
REDIS_DIRECTORY="$ROOT_DIRECTORY/vendor/redis-stable"
REDIS_SERVER="src/redis-server"

# Run -------------------------------------------------------------------------

cd $REDIS_DIRECTORY

if [ -x $REDIS_SERVER ]; then
  $REDIS_SERVER
else
  echo "$REDIS_SERVER is not readable or does not exist"
fi
