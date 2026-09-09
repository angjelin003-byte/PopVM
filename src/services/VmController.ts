import { QemuConfigOptions, TerminalLine, VmStatus } from '../types';
import { QemuProcess } from './QemuProcess';
import { QemuConfig } from './QemuConfig';

export class VmController {
  private qemu: QemuProcess | null = null;
  private status: VmStatus = 'STOPPED';
  private config: QemuConfigOptions = QemuConfig.getDefaultOptions();

  constructor(
    private onStatusChange: (status: VmStatus) => void,
    private onOutput: (line: TerminalLine) => void
  ) {}

  setConfig(options: QemuConfigOptions): void {
    this.config = options;
  }

  getConfig(): QemuConfigOptions {
    return this.config;
  }

  getStatus(): VmStatus {
    return this.status;
  }

  start(): void {
    if (this.qemu) return;

    this.setStatus('STARTING');

    this.qemu = new QemuProcess(
      (line) => this.onOutput(line),
      (running) => {
        if (!running) {
          this.setStatus('STOPPED');
          this.qemu = null;
        }
      }
    );

    this.qemu.start(
      this.config.distroName,
      this.config.memoryMb,
      this.config.smpCores,
      this.config.diskSizeGb,
      this.config.isoFile
    );

    setTimeout(() => {
      if (this.status === 'STARTING') {
        this.setStatus('RUNNING');
      }
    }, 3400);
  }

  stop(): void {
    if (!this.qemu) return;
    this.setStatus('STOPPING');
    this.qemu.stop();
    this.qemu = null;
    this.setStatus('STOPPED');
  }

  sendCommand(cmd: string): void {
    this.qemu?.executeCommand(cmd);
  }

  private setStatus(newStatus: VmStatus): void {
    this.status = newStatus;
    this.onStatusChange(newStatus);
  }
}
