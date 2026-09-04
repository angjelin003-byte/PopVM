#!/bin/bash
set -e

# Setup paths
export WORKSPACE=$(pwd)
export NDK_ROOT="${ANDROID_NDK_LATEST_HOME:-/usr/local/lib/android/sdk/ndk-bundle}"
export TOOLCHAIN="${NDK_ROOT}/toolchains/llvm/prebuilt/linux-x86_64/bin"
export PREFIX="${WORKSPACE}/sysroot-android"

export PATH="${TOOLCHAIN}:${PATH}"
export PKG_CONFIG_PATH="${PREFIX}/lib/pkgconfig:${PREFIX}/share/pkgconfig"
export PKG_CONFIG_LIBDIR="${PREFIX}/lib/pkgconfig"

mkdir -p "${PREFIX}"

echo "=== 1. Building GLib 2.0 for Android ==="
if [ ! -d "glib" ]; then
  git clone --depth 1 --branch 2.78.0 https://gitlab.gnome.org/GNOME/glib.git
fi

cd glib
meson setup build-android \
  --cross-file "${WORKSPACE}/android-aarch64.ini" \
  --prefix="${PREFIX}" \
  --buildtype=release \
  -Diconv=external \
  -Dlibmount=disabled \
  -Dselinux=disabled \
  -Dtests=false

ninja -C build-android install
cd "${WORKSPACE}"

echo "=== 2. Configuring QEMU / PopVM with Meson ==="
mkdir -p build-android
cd build-android

../qemu/source/configure \
  --cross-prefix=aarch64-linux-android- \
  --target-list=aarch64-softmmu \
  --enable-tools \
  --disable-system \
  --extra-cflags="-I${PREFIX}/include" \
  --extra-ldflags="-L${PREFIX}/lib" \
  --meson=meson

echo "=== 3. Executing Build ==="
ninja
