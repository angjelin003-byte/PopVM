#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/qemu/source/build-android/aarch64-softmmu/qemu-system-aarch64"
DST="$ROOT/app/src/main/jniLibs/arm64-v8a"

mkdir -p "$DST"
cp "$SRC" "$DST/libqemu.so"
