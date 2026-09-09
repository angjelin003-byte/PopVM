import { Monitor, RotateCw, Maximize2 } from 'lucide-react';
import { VmStatus } from '../types';

interface HeaderProps {
  status: VmStatus;
  isLandscape: boolean;
  onToggleLandscape: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function Header({
  status,
  isLandscape,
  onToggleLandscape,
  isFullscreen,
  onToggleFullscreen
}: HeaderProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RUNNING
          </span>
        );
      case 'STARTING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-950/80 border border-amber-500/30 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            BOOTING
          </span>
        );
      case 'STOPPING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-orange-950/80 border border-orange-500/30 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            STOPPING
          </span>
        );
      case 'STOPPED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            READY
          </span>
        );
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Monitor className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 tracking-tight">PopVM</h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              64-bit Virtual Machine
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {getStatusBadge()}

        <button
          onClick={onToggleLandscape}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            isLandscape
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Landscape Display Mode"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLandscape ? 'Landscape Mode' : 'Standard Mode'}</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
            isFullscreen
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
