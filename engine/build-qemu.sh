#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QEMU="$ROOT/qemu/source"

if [ ! -d "$QEMU" ]; then
    git clone --depth 1 https://gitlab.com/qemu-project/qemu.git "$QEMU"
fi

cd "$QEMU"

mkdir -p build-android
cd build-android

../configure \
    --target-list=aarch64-softmmu \
    --enable-strip \
    --disable-werror \
    --disable-gtk \
    --disable-sdl \
    --disable-vnc \
    --disable-docs

ninja
