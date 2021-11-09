#!/bin/sh

# Functions -------------------------------------------------------------------

# Configuration ---------------------------------------------------------------

ROOT_DIRECTORY=$(dirname $(dirname ${BASH_SOURCE[0]:-$0}))
ROOT_DIRECTORY=$(realpath $ROOT_DIRECTORY)

# Install ---------------------------------------------------------------------

if [ ! -f /opt/src/node-observer/config/launchd/redis.plist ]; then
  source $ROOT_DIRECTORY/bin/install-server.sh
fi

# Services --------------------------------------------------------------------

if [ $(command -v launchctl) ]; then
  sudo launchctl load /opt/src/node-observer/config/launchd/redis.plist
  sudo launchctl load /opt/src/node-observer/config/launchd/publisher-node.plist
else
  echo "launchd or sytemd missing"
fi

# Run -------------------------------------------------------------------------
