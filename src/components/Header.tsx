import React from 'react';
import { Cpu, Settings, Terminal as TerminalIcon } from 'lucide-react';
import { VmStatus } from '../types';

interface HeaderProps {
  status: VmStatus;
  onOpenConfig: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onOpenConfig,
  showTerminal,
  onToggleTerminal
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'RUNNING':
        return (
          <span id="vm-status-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            RUNNING
          </span>
        );
      case 'STARTING':
        return (
          <span id="vm-status-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            BOOTING
          </span>
        );
      case 'STOPPING':
        return (
          <span id="vm-status-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            STOPPING
          </span>
        );
      case 'STOPPED':
      default:
        return (
          <span id="vm-status-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            STOPPED
          </span>
        );
    }
  };

  return (
    <header className="w-full bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg tracking-wider">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">PopVM</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              ARM64 (QEMU)
            </span>
          </div>
          <p className="text-xs text-zinc-400">Virtual Machine Controller for Android & Web</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <button
          id="btn-toggle-terminal"
          onClick={onToggleTerminal}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showTerminal
              ? 'bg-zinc-800 text-cyan-400 border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
          }`}
          title="Toggle Terminal View"
        >
          <TerminalIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Terminal</span>
        </button>

        <button
          id="btn-open-config"
          onClick={onOpenConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          title="Storage & QEMU Config"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Config</span>
        </button>
      </div>
    </header>
  );
};
