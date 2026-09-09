import { IsoInfo } from '../types';

export class IsoManager {
  private static defaultPath = '/data/user/0/com.example.popvm/files/linux.iso';

  static getIso(): string {
    return this.defaultPath;
  }

  static getIsoInfo(): IsoInfo {
    return {
      name: 'linux.iso',
      path: this.defaultPath,
      size: '648 MB',
      arch: 'ARM64 (aarch64)',
      status: 'Attached'
    };
  }
}
