export type VmStatus = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING';

export interface QemuConfigOptions {
  arch: string;
  machine: string;
  cpu: string;
  memoryMb: number;
  smpCores: number;
  diskFile: string;
  diskFormat: string;
  isoFile: string;
  bootOrder: string;
  nographic: boolean;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'cmd' | 'boot' | 'kernel' | 'init' | 'user' | 'error' | 'success';
}

export interface DiskInfo {
  name: string;
  path: string;
  format: string;
  virtualSize: string;
  actualSize: string;
  status: 'Ready' | 'Mounted';
}

export interface IsoInfo {
  name: string;
  path: string;
  size: string;
  arch: string;
  status: 'Attached' | 'Not Found';
}
