export type VmStatus = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING';

export interface DistroPreset {
  id: string;
  name: string;
  description: string;
  desktopEnv: string;
  size: string;
  arch: string;
  defaultIsoPath: string;
  icon: string;
}

export interface QemuConfigOptions {
  arch: string;
  machine: string;
  cpu: string;
  memoryMb: number;
  smpCores: number;
  diskSizeGb: number;
  diskFile: string;
  diskFormat: string;
  distroName: string;
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
