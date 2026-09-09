import React from 'react';
import { X, HardDrive, Disc, Cpu, Terminal, CheckCircle2 } from 'lucide-react';
import { QemuConfigOptions, VmStatus } from '../types';
import { IsoManager } from '../services/IsoManager';
import { StorageManager } from '../services/StorageManager';
import { QemuConfig } from '../services/QemuConfig';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QemuConfigOptions;
  onUpdateConfig: (options: Partial<QemuConfigOptions>) => void;
  status: VmStatus;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  status,
}) => {
  if (!isOpen) return null;

  const isoInfo = IsoManager.getIsoInfo();
  const diskInfo = StorageManager.getDiskInfo();
  const qemuArgs = QemuConfig.buildArgs(config);
  const isVmStopped = status === 'STOPPED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">QEMU & Storage Configuration</h2>
              <p className="text-xs text-zinc-400">Settings from QemuConfig, IsoManager, and StorageManager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          {!isVmStopped && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Virtual machine is currently running. Stop the VM before modifying hardware parameters.</span>
            </div>
          )}

          {/* Virtual Hardware Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Virtual Hardware (QemuConfig)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Architecture & Machine</label>
                <div className="font-mono text-xs text-zinc-200">
                  {config.arch} -machine {config.machine} -cpu {config.cpu}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">RAM Allocation (-m)</label>
                <select
                  disabled={!isVmStopped}
                  value={config.memoryMb}
                  onChange={(e) => onUpdateConfig({ memoryMb: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  <option value={1024}>1024 MB (1 GB)</option>
                  <option value={2048}>2048 MB (2 GB - Default)</option>
                  <option value={4096}>4096 MB (4 GB)</option>
                </select>
              </div>

              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">vCPU Cores (-smp)</label>
                <select
                  disabled={!isVmStopped}
                  value={config.smpCores}
                  onChange={(e) => onUpdateConfig({ smpCores: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  <option value={1}>1 Core</option>
                  <option value={2}>2 Cores (Default)</option>
                  <option value={4}>4 Cores</option>
                </select>
              </div>

              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display Output</label>
                <div className="font-mono text-xs text-zinc-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>-nographic (Serial Console)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage & ISO Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Storage & Media
            </h3>
            <div className="space-y-3">
              {/* StorageManager Disk */}
              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200 text-xs">Primary Disk (StorageManager)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {diskInfo.status}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-zinc-400 truncate mt-1">
                    {diskInfo.path}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex gap-4">
                    <span>Format: <strong className="text-zinc-400">{diskInfo.format}</strong></span>
                    <span>Virtual Size: <strong className="text-zinc-400">{diskInfo.virtualSize}</strong></span>
                    <span>Bus: <strong className="text-zinc-400">virtio</strong></span>
                  </div>
                </div>
              </div>

              {/* IsoManager CD-ROM */}
              <div className="p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Disc className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200 text-xs">CD-ROM Image (IsoManager)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                      {isoInfo.status}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-zinc-400 truncate mt-1">
                    {isoInfo.path}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex gap-4">
                    <span>File: <strong className="text-zinc-400">{isoInfo.name}</strong></span>
                    <span>Arch: <strong className="text-zinc-400">{isoInfo.arch}</strong></span>
                    <span>Boot Flag: <strong className="text-zinc-400">-boot {config.bootOrder}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QEMU CLI Preview */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> QEMU Command Line Invocation
            </h3>
            <div className="p-3.5 bg-black rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400 break-all leading-relaxed">
              $ {qemuArgs.join(' ')}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/95 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
