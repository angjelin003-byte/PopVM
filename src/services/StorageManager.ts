import { DiskInfo } from '../types';

export class StorageManager {
  private static defaultPath = '/data/user/0/com.example.popvm/files/linux.qcow2';
  static readonly DISK_OPTIONS = [1, 3, 5]; // 1, 3, 5 GB as specified

  static getDisk(): string {
    return this.defaultPath;
  }

  static getDiskInfo(sizeGb: number = 3): DiskInfo {
    const actualSize = sizeGb === 1 ? '480 MB' : sizeGb === 3 ? '1.2 GB' : '1.9 GB';
    return {
      name: 'linux.qcow2',
      path: this.defaultPath,
      format: 'qcow2',
      virtualSize: `${sizeGb} GB`,
      actualSize,
      status: 'Ready'
    };
  }
}
