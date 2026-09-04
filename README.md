# PopVM

ARM64 Linux virtual machine for Android using QEMU.

## Build

```bash
chmod +x gradlew engine/*.sh scripts/*.sh
./engine/build-android.sh
./gradlew :app:assembleDebug
