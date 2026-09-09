import { QemuConfigOptions } from '../types';
import { StorageManager } from './StorageManager';
import { IsoManager } from './IsoManager';

export class QemuConfig {
  static getDefaultOptions(): QemuConfigOptions {
    const defaultDistro = IsoManager.getDefaultDistro();
    return {
      arch: 'aarch64',
      machine: 'virt',
      cpu: 'max',
      memoryMb: 2048,
      smpCores: 2,
      diskSizeGb: 3,
      diskFile: StorageManager.getDisk(),
      diskFormat: 'qcow2',
      distroName: defaultDistro.name,
      isoFile: defaultDistro.defaultIsoPath,
      bootOrder: 'd',
      nographic: false
    };
  }

  static buildArgs(options: QemuConfigOptions = this.getDefaultOptions()): string[] {
    const iso = options.isoFile || IsoManager.getDefaultDistro().defaultIsoPath;
    const disk = options.diskFile || StorageManager.getDisk();

    return [
      'qemu-system-aarch64',
      '-machine', options.machine || 'virt',
      '-cpu', options.cpu || 'max',
      '-m', `${options.memoryMb}`,
      '-smp', `${options.smpCores}`,
      '-drive', `if=virtio,file=${disk},format=${options.diskFormat || 'qcow2'}`,
      '-cdrom', iso,
      '-boot', options.bootOrder || 'd',
      '-device', 'virtio-gpu-pci',
      '-display', 'default'
    ];
  }
}
