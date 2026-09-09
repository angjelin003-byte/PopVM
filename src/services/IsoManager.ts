import { DistroPreset, IsoInfo } from '../types';

export class IsoManager {
  static readonly PRESET_DISTROS: DistroPreset[] = [
    {
      id: 'popos',
      name: 'Pop!_OS 24.04 LTS',
      description: 'Fast modern Linux desktop powered by COSMIC Desktop',
      desktopEnv: 'COSMIC Desktop',
      size: '2.8 GB',
      arch: 'ARM64 (aarch64)',
      defaultIsoPath: '/data/user/0/com.example.popvm/files/pop-os-arm64.iso',
      icon: '🐧'
    },
    {
      id: 'alpine',
      name: 'Alpine Linux 3.20 (GUI)',
      description: 'Ultra-lightweight distribution with XFCE/Sway desktop',
      desktopEnv: 'XFCE / Sway',
      size: '210 MB',
      arch: 'ARM64 (aarch64)',
      defaultIsoPath: '/data/user/0/com.example.popvm/files/alpine-standard-arm64.iso',
      icon: '🏔️'
    },
    {
      id: 'ubuntu',
      name: 'Ubuntu 24.04 LTS Desktop',
      description: 'Standard enterprise Linux desktop with GNOME Shell',
      desktopEnv: 'GNOME Desktop',
      size: '3.2 GB',
      arch: 'ARM64 (aarch64)',
      defaultIsoPath: '/data/user/0/com.example.popvm/files/ubuntu-desktop-arm64.iso',
      icon: '🟠'
    },
    {
      id: 'debian',
      name: 'Debian 12 Bookworm',
      description: 'Rock-solid workstation with lightweight XFCE desktop',
      desktopEnv: 'XFCE Desktop',
      size: '680 MB',
      arch: 'ARM64 (aarch64)',
      defaultIsoPath: '/data/user/0/com.example.popvm/files/debian-12-arm64.iso',
      icon: '🌀'
    },
    {
      id: 'arch',
      name: 'Arch Linux ARM',
      description: 'Bleeding edge rolling release with Wayland environment',
      desktopEnv: 'Wayland Desktop',
      size: '890 MB',
      arch: 'ARM64 (aarch64)',
      defaultIsoPath: '/data/user/0/com.example.popvm/files/archlinux-arm64.iso',
      icon: '⚡'
    }
  ];

  static getDefaultDistro(): DistroPreset {
    return this.PRESET_DISTROS[0];
  }

  static searchDistros(query: string): DistroPreset[] {
    if (!query.trim()) return this.PRESET_DISTROS;
    const q = query.toLowerCase().trim();
    return this.PRESET_DISTROS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.desktopEnv.toLowerCase().includes(q)
    );
  }

  static getIsoInfo(distro: DistroPreset = this.getDefaultDistro()): IsoInfo {
    return {
      name: distro.defaultIsoPath.split('/').pop() || 'linux.iso',
      path: distro.defaultIsoPath,
      size: distro.size,
      arch: distro.arch,
      status: 'Attached'
    };
  }
}
