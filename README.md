# PopVM (React Web App)

PopVM is an ARM64 Linux virtual machine manager and emulator rewritten from the original Android application into a modern React application.

## Ported Architecture & Features

- **Virtual Machine Controller (`VmController`)**:
  - Full lifecycle control: Start, Stop, ACPI shutdown, and reset.
  - Matches the original Android UI buttons (`START LINUX` and `STOP LINUX`) with exact component semantics and IDs.
- **QEMU Configuration (`QemuConfig`)**:
  - Manages ARM64 (`aarch64`) virt machine parameters (`-machine virt`, `-cpu max`, `-m 2048`, `-smp 2`, `-drive`, `-cdrom`, `-boot d`, `-nographic`).
  - Customizable hardware settings modal (RAM allocation: 1GB, 2GB, 4GB; vCPU count: 1, 2, 4 cores).
- **ISO Manager (`IsoManager`)**:
  - Virtual CD-ROM attachment (`linux.iso`) with mount verification and architecture checks.
- **Storage Manager (`StorageManager`)**:
  - Virtual primary disk management (`linux.qcow2`) with VirtIO block device emulation.
- **Interactive Linux Serial Console (`TerminalView` / `QemuProcess`)**:
  - Live console streaming matching standard QEMU serial output on `/dev/ttyAMA0`.
  - Realistic ARM64 Linux kernel boot sequence, systemd service startup, and interactive shell prompt (`root@popvm:~#`).
  - Interactive shell commands (`uname -a`, `lscpu`, `free -h`, `df -h`, `uptime`, `ls -la`, `cat`, `ps`, `qemu-info`, `poweroff`, `reboot`, `clear`).
  - Quick-command chips, auto-scroll toggle, and copy logs.

## Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
