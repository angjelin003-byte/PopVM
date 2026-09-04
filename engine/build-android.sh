#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"$ROOT/engine/prepare-qemu.sh"
"$ROOT/engine/build-qemu.sh"
"$ROOT/scripts/package-qemu.sh"
