import React from 'react';
import { Play, Square, Loader2, Power } from 'lucide-react';
import { VmStatus } from '../types';

interface VmControlsProps {
  status: VmStatus;
  onStart: () => void;
  onStop: () => void;
}

export const VmControls: React.FC<VmControlsProps> = ({
  status,
  onStart,
  onStop,
}) => {
  const isStarting = status === 'STARTING';
  const isStopping = status === 'STOPPING';
  const isStopped = status === 'STOPPED';

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-cyan-400 border border-zinc-700">
          <Power className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">Virtual Machine Controller</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Run ARM64 Linux under QEMU emulation with VirtIO storage & serial console
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center w-full">
        {/* START LINUX BUTTON - Exact match for original activity_main.xml startButton */}
        <button
          id="startButton"
          onClick={onStart}
          disabled={!isStopped}
          className={`w-[220px] h-12 rounded-xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
            isStopped
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
              <span>STARTING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>START LINUX</span>
            </>
          )}
        </button>

        {/* STOP LINUX BUTTON - Exact match for original activity_main.xml stopButton */}
        <button
          id="stopButton"
          onClick={onStop}
          disabled={isStopped || isStopping}
          className={`w-[220px] h-12 rounded-xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
            !isStopped && !isStopping
              ? 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-950/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50'
          }`}
        >
          {isStopping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
              <span>STOPPING...</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>STOP LINUX</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
        <span>Target: ARM64 virt machine (cpu: max, 2048 MB RAM)</span>
      </div>
    </div>
  );
};
