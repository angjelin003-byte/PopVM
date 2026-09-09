import { TerminalLine } from '../types';

export type OutputCallback = (line: TerminalLine) => void;
export type StateChangeCallback = (running: boolean) => void;

export class QemuProcess {
  private isRunning: boolean = false;
  private pid: number | null = null;
  private timeouts: number[] = [];
  private onOutput: OutputCallback | null = null;
  private onStateChange: StateChangeCallback | null = null;
  private memoryMb: number = 2048;
  private smpCores: number = 2;

  constructor(onOutput?: OutputCallback, onStateChange?: StateChangeCallback) {
    if (onOutput) this.onOutput = onOutput;
    if (onStateChange) this.onStateChange = onStateChange;
  }

  setCallbacks(onOutput: OutputCallback, onStateChange: StateChangeCallback) {
    this.onOutput = onOutput;
    this.onStateChange = onStateChange;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getPid(): number | null {
    return this.pid;
  }

  start(args: string[], memoryMb: number = 2048, smpCores: number = 2) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pid = Math.floor(10000 + Math.random() * 90000);
    this.memoryMb = memoryMb;
    this.smpCores = smpCores;
    this.onStateChange?.(true);

    this.emitLine({
      id: crypto.randomUUID(),
      text: `$ ${args.join(' ')}`,
      type: 'cmd',
    });

    const bootSequence: { text: string; delay: number; type: TerminalLine['type'] }[] = [
      { text: `[PopVM] Spawning QEMU process [PID ${this.pid}]...`, delay: 100, type: 'init' },
      { text: `[PopVM] VirtIO disk mounted (linux.qcow2)`, delay: 220, type: 'init' },
      { text: `[PopVM] VirtIO cdrom mounted (linux.iso)`, delay: 350, type: 'init' },
      { text: `[PopVM] Memory mapped: ${this.memoryMb}MB RAM, SMP: ${this.smpCores} cores (virt, aarch64)`, delay: 480, type: 'init' },
      { text: 'EFI stub: Booting Linux Kernel...', delay: 700, type: 'boot' },
      { text: 'EFI stub: Using DTB from configuration table', delay: 850, type: 'boot' },
      { text: 'EFI stub: Exiting boot services and installing virtual address map...', delay: 1000, type: 'boot' },
      { text: `[    0.000000] Booting Linux on physical CPU 0x0000000000 [0x410fd083]`, delay: 1200, type: 'kernel' },
      { text: `[    0.000000] Linux version 6.6.137-popvm-aarch64 (gcc version 13.2.0) #1 SMP PREEMPT`, delay: 1350, type: 'kernel' },
      { text: `[    0.000000] Machine model: linux,dummy-virt`, delay: 1500, type: 'kernel' },
      { text: `[    0.000000] Memory: ${this.memoryMb * 1024}K/${this.memoryMb * 1024}K available (${Math.floor(this.memoryMb * 0.9)}MB RAM free)`, delay: 1650, type: 'kernel' },
      { text: `[    0.000000] smp: Bringing up secondary CPUs ...`, delay: 1800, type: 'kernel' },
      { text: `[    0.000000] smp: Brought up 1 node, ${this.smpCores} CPUs`, delay: 1950, type: 'kernel' },
      { text: `[    0.000000] CPU features: detected: GICv3, PMUv3, CRC32, AES, SHA2`, delay: 2100, type: 'kernel' },
      { text: `[    0.042180] devtmpfs: initialized`, delay: 2250, type: 'kernel' },
      { text: `[    0.098412] virtio_blk virtio0: [vda] 41943040 512-byte logical blocks (21.5 GB)`, delay: 2400, type: 'kernel' },
      { text: `[    0.142018] virtio_net virtio1: eth0: renamed from eth0`, delay: 2550, type: 'kernel' },
      { text: `[    0.201490] EXT4-fs (vda1): mounted filesystem with ordered data mode`, delay: 2700, type: 'kernel' },
      { text: `systemd 255.4-1ubuntu8 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR)`, delay: 2900, type: 'init' },
      { text: `[  OK  ] Started Virtual Console Setup.`, delay: 3100, type: 'success' },
      { text: `[  OK  ] Reached target System Initialization.`, delay: 3300, type: 'success' },
      { text: `[  OK  ] Started D-Bus System Message Bus.`, delay: 3500, type: 'success' },
      { text: `[  OK  ] Started OpenSSH Server daemon.`, delay: 3700, type: 'success' },
      { text: `[  OK  ] Reached target Multi-User System.`, delay: 3900, type: 'success' },
      { text: `Pop!_OS GNU/Linux 24.04 LTS popvm ttyAMA0`, delay: 4100, type: 'init' },
      { text: `popvm login: root (automatic login)`, delay: 4300, type: 'init' },
      { text: `Welcome to PopVM Linux Virtual Machine (aarch64)!`, delay: 4500, type: 'success' },
      { text: `Type 'help' for built-in commands or 'poweroff' to halt.`, delay: 4650, type: 'init' },
      { text: `root@popvm:~# `, delay: 4750, type: 'user' },
    ];

    bootSequence.forEach((step) => {
      const timer = window.setTimeout(() => {
        if (!this.isRunning) return;
        this.emitLine({
          id: crypto.randomUUID(),
          text: step.text,
          type: step.type,
        });
      }, step.delay);
      this.timeouts.push(timer);
    });
  }

  executeCommand(cmd: string) {
    if (!this.isRunning) return;

    const trimmed = cmd.trim();
    this.emitLine({
      id: crypto.randomUUID(),
      text: `root@popvm:~# ${trimmed}`,
      type: 'user',
    });

    if (!trimmed) {
      this.emitLine({
        id: crypto.randomUUID(),
        text: `root@popvm:~# `,
        type: 'user',
      });
      return;
    }

    const parts = trimmed.split(' ');
    const main = parts[0].toLowerCase();

    switch (main) {
      case 'help':
        this.emitLines([
          'PopVM Linux Command Shell Emulator (QEMU aarch64)',
          'Available commands:',
          '  uname [-a]        Show Linux system & architecture info',
          '  lscpu             Display CPU architecture and core details',
          '  free [-h|-m]      Display memory (RAM) usage',
          '  df [-h]           Display virtual disk usage',
          '  uptime            Display VM uptime and load averages',
          '  ls [-la]          List directory contents',
          '  cat <file>        Read file (/etc/os-release, /proc/cpuinfo, /proc/version)',
          '  dmesg             Show kernel ring buffer logs',
          '  ps [aux]          List running processes',
          '  qemu-info         Display active QEMU emulator runtime configuration',
          '  clear             Clear terminal screen',
          '  poweroff, halt    Gracefully shutdown the virtual machine',
          '  reboot            Reboot virtual machine'
        ]);
        break;

      case 'uname':
        if (parts[1] === '-a' || parts.length === 1) {
          this.emitLine({
            id: crypto.randomUUID(),
            text: 'Linux popvm 6.6.137-popvm-aarch64 #1 SMP PREEMPT aarch64 GNU/Linux',
            type: 'boot'
          });
        } else {
          this.emitLine({
            id: crypto.randomUUID(),
            text: 'Linux',
            type: 'boot'
          });
        }
        break;

      case 'lscpu':
        this.emitLines([
          'Architecture:                    aarch64',
          'CPU op-mode(s):                  64-bit',
          'Byte Order:                      Little Endian',
          `CPU(s):                          ${this.smpCores}`,
          'On-line CPU(s) list:             0-' + (this.smpCores - 1),
          'Vendor ID:                       ARM',
          'Model name:                      Cortex-A78 (virt, max)',
          'Model:                           0',
          'Thread(s) per core:              1',
          `Core(s) per socket:              ${this.smpCores}`,
          'Socket(s):                       1',
          'Flags:                           fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma'
        ]);
        break;

      case 'free':
        this.emitLines([
          '               total        used        free      shared  buff/cache   available',
          `Mem:         ${this.memoryMb}M        184M       ${this.memoryMb - 240}M         12M         56M       ${this.memoryMb - 190}M`,
          'Swap:            0B          0B          0B'
        ]);
        break;

      case 'df':
        this.emitLines([
          'Filesystem     1K-blocks      Used Available Use% Mounted on',
          'udev             1013444         0   1013444   0% /dev',
          'tmpfs             205208       980    204228   1% /run',
          '/dev/vda1       20511312   2488100  17023212  13% /',
          'tmpfs            1026040         0   1026040   0% /dev/shm',
          '/dev/sr0          663552    663552         0 100% /media/cdrom'
        ]);
        break;

      case 'uptime':
        this.emitLine({
          id: crypto.randomUUID(),
          text: ` 16:48:10 up 2 min,  1 user,  load average: 0.08, 0.03, 0.01`,
          type: 'boot'
        });
        break;

      case 'ls':
        this.emitLines([
          'total 28',
          'drwxr-xr-x 4 root root 4096 Sep  9 16:47 .',
          'drwxr-xr-x 19 root root 4096 Sep  9 16:45 ..',
          '-rw-r--r-- 1 root root 3106 Apr 22 2024 .bashrc',
          '-rw-r--r-- 1 root root  161 Jul  9 2019 .profile',
          'drwxr-xr-x 2 root root 4096 Sep  9 16:47 demo',
          'drwx------ 2 root root 4096 Sep  9 16:47 .ssh'
        ]);
        break;

      case 'cat':
        const file = parts[1];
        if (file === '/etc/os-release') {
          this.emitLines([
            'NAME="Pop!_OS"',
            'VERSION="24.04 LTS"',
            'ID=pop',
            'ID_LIKE="ubuntu debian"',
            'PRETTY_NAME="Pop!_OS 24.04 LTS (ARM64)"',
            'VERSION_ID="24.04"',
            'HOME_URL="https://pop.system76.com/"',
            'SUPPORT_URL="https://support.system76.com/"'
          ]);
        } else if (file === '/proc/version') {
          this.emitLine({
            id: crypto.randomUUID(),
            text: 'Linux version 6.6.137-popvm-aarch64 (gcc version 13.2.0) #1 SMP PREEMPT',
            type: 'boot'
          });
        } else if (file === '/proc/cpuinfo') {
          this.emitLines([
            'processor       : 0',
            'BogoMIPS        : 40.00',
            'Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp',
            'CPU implementer : 0x41',
            'CPU architecture: 8',
            'CPU variant     : 0x3',
            'CPU part        : 0xd08',
            'CPU revision    : 2',
            '',
            ...(this.smpCores > 1 ? [
              'processor       : 1',
              'BogoMIPS        : 40.00',
              'Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp',
              'CPU implementer : 0x41',
              'CPU architecture: 8',
              'CPU variant     : 0x3',
              'CPU part        : 0xd08',
              'CPU revision    : 2',
            ] : [])
          ]);
        } else {
          this.emitLine({
            id: crypto.randomUUID(),
            text: `cat: ${file || ''}: No such file or directory`,
            type: 'error'
          });
        }
        break;

      case 'ps':
        this.emitLines([
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:01 systemd',
          '  381 ?        00:00:00 systemd-journal',
          '  412 ?        00:00:00 systemd-udevd',
          '  620 ?        00:00:00 dbus-daemon',
          '  780 ttyAMA0  00:00:00 login',
          '  842 ttyAMA0  00:00:00 bash',
          '  915 ttyAMA0  00:00:00 ps'
        ]);
        break;

      case 'qemu-info':
        this.emitLines([
          'QEMU Emulator Process Information:',
          `  PID:         ${this.pid}`,
          '  Arch:        aarch64 (ARM 64-bit)',
          '  Machine:     virt (QEMU ARM Virtual Machine)',
          '  CPU model:   max',
          `  Memory:      ${this.memoryMb} MB`,
          `  vCPUs (SMP): ${this.smpCores} cores`,
          '  Primary HDD: virtio-blk (linux.qcow2)',
          '  CD-ROM:      virtio-blk (linux.iso)',
          '  Console:     -nographic (serial ttyAMA0)'
        ]);
        break;

      case 'clear':
        // Handled in component
        break;

      case 'poweroff':
      case 'halt':
        this.stop();
        return;

      case 'reboot':
        this.emitLine({
          id: crypto.randomUUID(),
          text: 'The system is going down for reboot NOW!',
          type: 'init'
        });
        this.stop();
        setTimeout(() => {
          this.start([
            "qemu-system-aarch64",
            "-machine", "virt",
            "-cpu", "max",
            "-m", `${this.memoryMb}`,
            "-smp", `${this.smpCores}`,
            "-drive", "if=virtio,file=/data/user/0/com.example.popvm/files/linux.qcow2,format=qcow2",
            "-cdrom", "/data/user/0/com.example.popvm/files/linux.iso",
            "-boot", "d",
            "-nographic"
          ], this.memoryMb, this.smpCores);
        }, 1200);
        return;

      default:
        this.emitLine({
          id: crypto.randomUUID(),
          text: `bash: ${trimmed}: command not found. Type 'help' for available commands.`,
          type: 'error'
        });
        break;
    }

    this.emitLine({
      id: crypto.randomUUID(),
      text: `root@popvm:~# `,
      type: 'user',
    });
  }

  private emitLines(lines: string[]) {
    lines.forEach((l) => {
      this.emitLine({
        id: crypto.randomUUID(),
        text: l,
        type: 'boot',
      });
    });
  }

  private emitLine(line: TerminalLine) {
    this.onOutput?.(line);
  }

  stop() {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];

    if (this.isRunning) {
      this.emitLine({
        id: crypto.randomUUID(),
        text: `[PopVM] Sending SIGTERM to QEMU process [PID ${this.pid}]...`,
        type: 'init'
      });
      this.emitLine({
        id: crypto.randomUUID(),
        text: '[PopVM] ACPI shutdown signal delivered. QEMU process terminated.',
        type: 'cmd'
      });
    }

    this.isRunning = false;
    this.pid = null;
    this.onStateChange?.(false);
  }
}
