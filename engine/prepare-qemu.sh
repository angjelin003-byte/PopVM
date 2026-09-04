#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/qemu"

if [ ! -d "$ROOT/qemu/source/.git" ]; then
    git clone --depth 1 https://gitlab.com/qemu-project/qemu.git "$ROOT/qemu/source"
fi

cd "$ROOT/qemu/source"
git submodule update --init --recursive
