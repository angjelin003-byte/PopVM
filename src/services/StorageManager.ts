import { DiskInfo } from '../types';

export class StorageManager {
  private static defaultPath = '/data/user/0/com.example.popvm/files/linux.qcow2';

  static getDisk(): string {
    return this.defaultPath;
  }

  static getDiskInfo(): DiskInfo {
    return {
      name: 'linux.qcow2',
      path: this.defaultPath,
      format: 'qcow2',
      virtualSize: '20 GB',
      actualSize: '2.4 GB',
      status: 'Ready'
    };
  }
}
