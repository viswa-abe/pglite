#!/usr/bin/env bash
# Phase-0 base-image build for the pglite durability harness.
# De-risks the WASM toolchain by using the prebuilt npm package (DESIGN.md §14).
# The base image is prepared once from the default branch; workloads are injected
# per-run on top of it, so this build cost is paid once.
set -euo pipefail

npm init -y >/dev/null 2>&1 || true
npm install @electric-sql/pglite@^0.2

node -e "import('@electric-sql/pglite').then(() => console.log('pglite import OK'))"
