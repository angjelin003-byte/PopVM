#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/qemu/source/build-android"
DST="$ROOT/app/src/main/assets"

mkdir -p "$DST"

QEMU="$(find "$BUILD" -type f -name "qemu-system-aarch64" -perm -111 | head -n 1)"

if [ -z "$QEMU" ]; then
    echo "qemu-system-aarch64 not found"
    find "$BUILD" -type f -name "qemu-system-aarch64"
    exit 1
fi

cp "$QEMU" "$DST/qemu-system-aarch64"
chmod +x "$DST/qemu-system-aarch64"

ls -lh "$DST/qemu-system-aarch64"
