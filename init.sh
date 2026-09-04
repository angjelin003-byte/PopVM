#!/usr/bin/env bash
set -euo pipefail
mkdir -p app/src/main/java/com/example/qemu app/src/main/res/layout app/src/main/jniLibs/arm64-v8a engine/deps engine/jni engine/toolchain gradle/wrapper .github/workflows
git submodule add -b v8.2.2 https://gitlab.com/qemu-project/qemu.git engine/qemu || true
chmod +x engine/deps/build-zlib.sh engine/deps/build-pixman.sh engine/deps/build-glib.sh engine/build.sh build-apk.sh
