import { TerminalLine } from '../types';

export class QemuProcess {
  private isRunning = false;
  private pid: number | null = null;
  private distroName = 'Pop!_OS 24.04 LTS';
  private memoryMb = 2048;
  private smpCores = 2;
  private diskSizeGb = 3;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private onOutput: (line: TerminalLine) => void,
    private onStateChange: (running: boolean) => void
  ) {}

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getPid(): number | null {
    return this.pid;
  }

  start(
    distroName: string,
    memoryMb: number = 2048,
    smpCores: number = 2,
    diskSizeGb: number = 3,
    isoPath: string = ''
  ): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pid = Math.floor(Math.random() * 90000) + 10000;
    this.distroName = distroName;
    this.memoryMb = memoryMb;
    this.smpCores = smpCores;
    this.diskSizeGb = diskSizeGb;
    this.onStateChange(true);

    const isoName = isoPath ? isoPath.split('/').pop() : 'linux.iso';
    this.emitLine({
      id: Math.random().toString(),
      text: `Booting virtual machine from ${isoName}...`,
      type: 'cmd'
    });

    const bootSequence: { text: string; delay: number; type: TerminalLine['type'] }[] = [
      { text: `Initializing Virtual Hardware (64-bit ARM virt)...`, delay: 80, type: 'init' },
      { text: `RAM: ${memoryMb} MB | Cores: ${smpCores} vCPU | Disk: ${diskSizeGb} GB Virtual Storage`, delay: 180, type: 'init' },
      { text: `Attached ISO: ${isoName}`, delay: 300, type: 'init' },
      { text: `VirtIO GPU Display Adapter: Active (1920x1080 Landscape)`, delay: 450, type: 'init' },
      { text: `EFI Stub: Loading Linux kernel image...`, delay: 650, type: 'boot' },
      { text: `EFI Stub: Mounting boot initramfs and virtual address map...`, delay: 850, type: 'boot' },
      { text: `[    0.000000] Booting Linux on physical CPU 0x0000000000`, delay: 1050, type: 'kernel' },
      { text: `[    0.000000] Linux version 6.6.137 (gcc 13.2.0) #1 SMP PREEMPT`, delay: 1200, type: 'kernel' },
      { text: `[    0.000000] Memory available: ${memoryMb * 1024}K (${memoryMb - 210}MB RAM free)`, delay: 1350, type: 'kernel' },
      { text: `[    0.000000] SMP: Initialized ${smpCores} virtual processor cores`, delay: 1500, type: 'kernel' },
      { text: `[    0.081240] virtio_blk virtio0: [vda] ${diskSizeGb * 2097152} blocks (${diskSizeGb}.0 GB)`, delay: 1700, type: 'kernel' },
      { text: `[    0.142018] virtio_gpu: initialized KMS display framebuffer`, delay: 1850, type: 'kernel' },
      { text: `[    0.198412] virtio_net: eth0 network link ready`, delay: 2000, type: 'kernel' },
      { text: `systemd 255 running in graphical target mode`, delay: 2200, type: 'init' },
      { text: `[  OK  ] Started Graphical Display Manager (Wayland/X11).`, delay: 2400, type: 'success' },
      { text: `[  OK  ] Mounted Virtual Storage Filesystem (${diskSizeGb} GB).`, delay: 2600, type: 'success' },
      { text: `[  OK  ] Started D-Bus System Message Bus.`, delay: 2800, type: 'success' },
      { text: `[  OK  ] Reached target Graphical Desktop Environment.`, delay: 3000, type: 'success' },
      { text: `Welcome to ${distroName}!`, delay: 3200, type: 'success' },
      { text: `Desktop session is live in landscape mode. Terminal console is ready.`, delay: 3400, type: 'init' },
      { text: `root@popvm:~# `, delay: 3500, type: 'user' }
    ];

    bootSequence.forEach((step) => {
      const timer = setTimeout(() => {
        if (!this.isRunning) return;
        this.emitLine({
          id: Math.random().toString(),
          text: step.text,
          type: step.type
        });
      }, step.delay);
      this.timers.push(timer);
    });
  }

  executeCommand(cmd: string): void {
    if (!this.isRunning) return;

    const trimmed = cmd.trim();
    this.emitLine({
      id: Math.random().toString(),
      text: `root@popvm:~# ${trimmed}`,
      type: 'user'
    });

    if (!trimmed) {
      this.emitLine({ id: Math.random().toString(), text: `root@popvm:~# `, type: 'user' });
      return;
    }

    const parts = trimmed.split(' ').filter(Boolean);
    const main = parts[0].toLowerCase();

    switch (main) {
      case 'help':
        this.emitLines([
          `PopVM Linux Shell (${this.distroName})`,
          'Available commands:',
          '  uname [-a]        Show Linux system info',
          '  lscpu             Display processor cores & architecture',
          '  free [-h|-m]      Display memory (RAM) allocation',
          `  df [-h]           Display virtual disk (${this.diskSizeGb} GB) usage`,
          '  uptime            Display VM uptime & load',
          '  ls [-la]          List directory contents',
          '  cat <file>        Read /etc/os-release or /proc/cpuinfo',
          '  ps                List running processes & desktop manager',
          '  clear             Clear terminal screen',
          '  reboot            Reboot virtual machine',
          '  poweroff, halt    Shutdown virtual machine'
        ]);
        break;
      case 'uname':
        this.emitLine({
          id: Math.random().toString(),
          text: 'Linux popvm 6.6.137-popvm-arm64 #1 SMP PREEMPT aarch64 GNU/Linux',
          type: 'boot'
        });
        break;
      case 'lscpu':
        this.emitLines([
          'Architecture:                    aarch64',
          'CPU op-mode(s):                  64-bit',
          `CPU(s):                          ${this.smpCores}`,
          'Model name:                      Cortex-A78 (Virtual CPU)',
          `Core(s) per socket:              ${this.smpCores}`,
          'Flags:                           fp asimd aes pmull sha1 sha2 crc32 atomics'
        ]);
        break;
      case 'free':
        this.emitLines([
          '               total        used        free      shared  buff/cache   available',
          `Mem:         ${this.memoryMb}M        240M       ${this.memoryMb - 320}M         16M         64M       ${this.memoryMb - 260}M`,
          'Swap:            0B          0B          0B'
        ]);
        break;
      case 'df':
        this.emitLines([
          'Filesystem     1K-blocks      Used Available Use% Mounted on',
          `/dev/vda1        ${this.diskSizeGb * 1024 * 1024}    480000  ${this.diskSizeGb * 1024 * 1024 - 480000}   12% /`,
          'tmpfs             205208       980    204228   1% /run',
          '/dev/sr0         2800000   2800000         0 100% /media/cdrom'
        ]);
        break;
      case 'uptime':
        this.emitLine({
          id: Math.random().toString(),
          text: ' 12:00:00 up 1 min,  1 user,  load average: 0.04, 0.02, 0.00',
          type: 'boot'
        });
        break;
      case 'ls':
        this.emitLines(['Desktop  Documents  Downloads  Music  Pictures  Videos  installer.desktop']);
        break;
      case 'cat':
        if (parts[1] === '/etc/os-release') {
          this.emitLines([
            `NAME="${this.distroName}"`,
            `PRETTY_NAME="${this.distroName}"`,
            'ID=linux',
            'VERSION_ID="24.04"',
            'HOME_URL="https://popvm.local"'
          ]);
        } else {
          this.emitLine({
            id: Math.random().toString(),
            text: `cat: ${parts[1] || ''}: No such file or directory`,
            type: 'error'
          });
        }
        break;
      case 'ps':
        this.emitLines([
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:01 systemd',
          '  412 ?        00:00:00 cosmic-session',
          '  520 ?        00:00:00 wayland-display',
          '  780 ttyAMA0  00:00:00 bash',
          '  890 ttyAMA0  00:00:00 ps'
        ]);
        break;
      case 'poweroff':
      case 'halt':
        this.stop();
        return;
      case 'reboot':
        this.emitLine({ id: Math.random().toString(), text: 'Rebooting virtual machine...', type: 'init' });
        this.stop();
        setTimeout(() => {
          this.start(this.distroName, this.memoryMb, this.smpCores, this.diskSizeGb);
        }, 1000);
        return;
      default:
        this.emitLine({
          id: Math.random().toString(),
          text: `bash: ${trimmed}: command not found. Type 'help' for available commands.`,
          type: 'error'
        });
        break;
    }

    this.emitLine({ id: Math.random().toString(), text: `root@popvm:~# `, type: 'user' });
  }

  private emitLines(lines: string[]): void {
    lines.forEach((line) => {
      this.emitLine({ id: Math.random().toString(), text: line, type: 'boot' });
    });
  }

  private emitLine(line: TerminalLine): void {
    this.onOutput(line);
  }

  stop(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];

    if (this.isRunning) {
      this.emitLine({
        id: Math.random().toString(),
        text: 'ACPI shutdown signal received. Virtual machine stopped.',
        type: 'init'
      });
    }

    this.isRunning = false;
    this.pid = null;
    this.onStateChange(false);
  }
}
