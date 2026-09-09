import { IsoManager } from './IsoManager';
import { StorageManager } from './StorageManager';
import { QemuConfigOptions } from '../types';

export class QemuConfig {
  static getDefaultOptions(): QemuConfigOptions {
    return {
      arch: 'qemu-system-aarch64',
      machine: 'virt',
      cpu: 'max',
      memoryMb: 2048,
      smpCores: 2,
      diskFile: StorageManager.getDisk(),
      diskFormat: 'qcow2',
      isoFile: IsoManager.getIso(),
      bootOrder: 'd',
      nographic: true,
    };
  }

  static buildArgs(options: QemuConfigOptions = this.getDefaultOptions()): string[] {
    const iso = options.isoFile || IsoManager.getIso();
    const disk = options.diskFile || StorageManager.getDisk();

    return [
      options.arch || "qemu-system-aarch64",
      "-machine", options.machine || "virt",
      "-cpu", options.cpu || "max",
      "-m", `${options.memoryMb || 2048}`,
      "-smp", `${options.smpCores || 2}`,
      "-drive", `if=virtio,file=${disk},format=${options.diskFormat || 'qcow2'}`,
      "-cdrom", iso,
      "-boot", options.bootOrder || "d",
      ...(options.nographic ? ["-nographic"] : [])
    ];
  }

  static default(): string[] {
    const iso = IsoManager.getIso();
    const disk = StorageManager.getDisk();

    return [
      "qemu-system-aarch64",
      "-machine", "virt",
      "-cpu", "max",
      "-m", "2048",
      "-smp", "2",
      "-drive", `if=virtio,file=${disk},format=qcow2`,
      "-cdrom", iso,
      "-boot", "d",
      "-nographic"
    ];
  }
}
