#!/bin/sh

# Functions -------------------------------------------------------------------

# Configuration ---------------------------------------------------------------

ROOT_DIRECTORY=$(dirname $(dirname ${BASH_SOURCE[0]:-$0}))
VENDOR_DIRECTORY="$ROOT_DIRECTORY/vendor"
REDIS_CLI="$VENDOR_DIRECTORY/redis-stable/src/redis-cli"

# Run -------------------------------------------------------------------------

$REDIS_CLI FLUSHDB
$REDIS_CLI FLUSHALL