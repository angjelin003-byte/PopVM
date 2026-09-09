import { useState, useEffect, useRef } from 'react';
import { VmController } from './services/VmController';
import { Header } from './components/Header';
import { VmControls } from './components/VmControls';
import { TerminalView } from './components/TerminalView';
import { ConfigModal } from './components/ConfigModal';
import { TerminalLine, VmStatus, QemuConfigOptions } from './types';
import { QemuConfig } from './services/QemuConfig';
import { Cpu, HardDrive, Disc, MemoryStick } from 'lucide-react';

export function App() {
  const [status, setStatus] = useState<VmStatus>('STOPPED');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [config, setConfig] = useState<QemuConfigOptions>(QemuConfig.getDefaultOptions());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  const vmRef = useRef<VmController | null>(null);

  useEffect(() => {
    const vm = new VmController(
      (newStatus) => {
        setStatus(newStatus);
      },
      (newLine) => {
        setLines((prev) => [...prev, newLine]);
      }
    );

    vmRef.current = vm;

    return () => {
      vm.stop();
    };
  }, []);

  const handleStart = () => {
    vmRef.current?.start();
  };

  const handleStop = () => {
    vmRef.current?.stop();
  };

  const handleSendCommand = (cmd: string) => {
    if (cmd.trim() === 'clear') {
      setLines([]);
      return;
    }
    vmRef.current?.sendCommand(cmd);
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleUpdateConfig = (newOptions: Partial<QemuConfigOptions>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newOptions };
      vmRef.current?.setConfig(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col">
      {/* Top Application Bar */}
      <Header
        status={status}
        onOpenConfig={() => setIsConfigOpen(true)}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Section: Android-faithful Central VM Controls + Quick Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Action Card (Matches activity_main.xml layout and IDs) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <VmControls
              status={status}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>

          {/* Machine Architecture & Quick Specs Info Card */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Virtual Machine Environment
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  QEMU v9.2.0
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <MemoryStick className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Memory</span>
                  </div>
                  <p className="font-semibold text-sm text-zinc-100">{config.memoryMb} MB RAM</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">VirtIO Balloon Driver</p>
                </div>

                <div className="p-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Processors</span>
                  </div>
                  <p className="font-semibold text-sm text-zinc-100">{config.smpCores} vCPU Cores</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Cortex-A78 (max)</p>
                </div>

                <div className="p-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Storage (qcow2)</span>
                  </div>
                  <p className="font-semibold text-sm text-zinc-100 truncate">linux.qcow2</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">20 GB Virtual Disk</p>
                </div>

                <div className="p-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <Disc className="w-3.5 h-3.5 text-amber-400" />
                    <span>ISO Image</span>
                  </div>
                  <p className="font-semibold text-sm text-zinc-100 truncate">linux.iso</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Boot order: -boot d</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">Command-line QEMU process manager</span>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
              >
                Modify Hardware &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Output & Shell View */}
        {showTerminal && (
          <div className="flex-1 flex flex-col min-h-[380px]">
            <TerminalView
              lines={lines}
              status={status}
              onSendCommand={handleSendCommand}
              onClear={handleClear}
            />
          </div>
        )}
      </main>

      {/* QEMU & Storage Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        status={status}
      />
    </div>
  );
}
export default App;
