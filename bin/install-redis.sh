#!/bin/sh

# Configuration ---------------------------------------------------------------

ROOT_DIRECTORY=$(dirname $(dirname ${BASH_SOURCE[0]:-$0}))
VENDOR_DIRECTORY="$ROOT_DIRECTORY/vendor"
REDIS_FILE="redis-stable"
REDIS_URL="https://download.redis.io/releases/$REDIS_FILE.tar.gz"

# Download --------------------------------------------------------------------

if [ ! -d $VENDOR_DIRECTORY ]; then
  echo "Creating directory $VENDOR_DIRECTORY..."
  mkdir $VENDOR_DIRECTORY
fi

cd $VENDOR_DIRECTORY

echo "Downloading files from $REDIS_URL..."
curl --output - $REDIS_URL | tar -xz

# Build -----------------------------------------------------------------------

cd $REDIS_FILE

if [ ! make ]: then
  echo "Error. Reverting..."
  cd ..
  rm -rf $REDIS_FILE
fi

# Run -------------------------------------------------------------------------

src/redis-server
