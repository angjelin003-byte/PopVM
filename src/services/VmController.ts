import { QemuConfig } from './QemuConfig';
import { QemuProcess } from './QemuProcess';
import { QemuConfigOptions, TerminalLine, VmStatus } from '../types';

export class VmController {
  private qemu: QemuProcess | null = null;
  private status: VmStatus = 'STOPPED';
  private onStatusChange: ((status: VmStatus) => void) | null = null;
  private onOutput: ((line: TerminalLine) => void) | null = null;
  private config: QemuConfigOptions;

  constructor(
    onStatusChange?: (status: VmStatus) => void,
    onOutput?: (line: TerminalLine) => void
  ) {
    if (onStatusChange) this.onStatusChange = onStatusChange;
    if (onOutput) this.onOutput = onOutput;
    this.config = QemuConfig.getDefaultOptions();
  }

  setCallbacks(
    onStatusChange: (status: VmStatus) => void,
    onOutput: (line: TerminalLine) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onOutput = onOutput;
  }

  setConfig(options: Partial<QemuConfigOptions>) {
    this.config = { ...this.config, ...options };
  }

  getConfig(): QemuConfigOptions {
    return { ...this.config };
  }

  getStatus(): VmStatus {
    return this.status;
  }

  start() {
    if (this.qemu != null) return;

    this.setStatus('STARTING');

    this.qemu = new QemuProcess(
      (line) => {
        this.onOutput?.(line);
      },
      (running) => {
        if (!running) {
          this.setStatus('STOPPED');
          this.qemu = null;
        }
      }
    );

    const args = QemuConfig.buildArgs(this.config);
    this.qemu.start(args, this.config.memoryMb, this.config.smpCores);

    setTimeout(() => {
      if (this.status === 'STARTING') {
        this.setStatus('RUNNING');
      }
    }, 4500);
  }

  stop() {
    if (this.qemu == null) return;
    this.setStatus('STOPPING');
    this.qemu.stop();
    this.qemu = null;
    this.setStatus('STOPPED');
  }

  sendCommand(cmd: string) {
    this.qemu?.executeCommand(cmd);
  }

  private setStatus(newStatus: VmStatus) {
    this.status = newStatus;
    this.onStatusChange?.(newStatus);
  }
}
