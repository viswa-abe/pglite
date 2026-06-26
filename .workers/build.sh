#!/usr/bin/env sh
# Phase-0: @electric-sql/pglite is vendored at .workers/node_modules because the
# prepare worker host has no node/npm. This script's presence also makes prepare
# skip the pglite monorepo dependency install. Nothing to build.
set -eu
echo "pglite vendored at .workers/node_modules; no build step needed"
