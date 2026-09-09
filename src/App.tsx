import { useState, useEffect, useRef } from 'react';
import { VmController } from './services/VmController';
import { Header } from './components/Header';
import { VirtualMachineView } from './components/VirtualMachineView';
import { TerminalLine, VmStatus, QemuConfigOptions, DistroPreset } from './types';
import { QemuConfig } from './services/QemuConfig';
import { IsoManager } from './services/IsoManager';
import {
  Search,
  HardDrive,
  Cpu,
  MemoryStick,
  Power,
  FolderOpen,
  CheckCircle2,
  Disc,
  Layers
} from 'lucide-react';

export function App() {
  const [status, setStatus] = useState<VmStatus>('STOPPED');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [config, setConfig] = useState<QemuConfigOptions>(QemuConfig.getDefaultOptions());
  const [selectedDistro, setSelectedDistro] = useState<DistroPreset>(IsoManager.getDefaultDistro());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLandscape, setIsLandscape] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const updated = {
      ...config,
      distroName: selectedDistro.name,
      isoFile: selectedDistro.defaultIsoPath
    };
    setConfig(updated);
    vmRef.current?.setConfig(updated);
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

  const handleSelectDistro = (distro: DistroPreset) => {
    setSelectedDistro(distro);
    const updated = {
      ...config,
      distroName: distro.name,
      isoFile: distro.defaultIsoPath
    };
    setConfig(updated);
    vmRef.current?.setConfig(updated);
  };

  const handleCustomIsoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const customDistro: DistroPreset = {
        id: 'custom',
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: 'Custom ISO image from local disk',
        desktopEnv: 'Linux Desktop',
        size: `${(file.size / (1024 * 1024)).toFixed(0)} MB`,
        arch: 'ARM64 (aarch64)',
        defaultIsoPath: `/data/user/0/com.example.popvm/files/${file.name}`,
        icon: '📁'
      };
      handleSelectDistro(customDistro);
    }
  };

  const filteredDistros = IsoManager.searchDistros(searchQuery);

  return (
    <div
      className={`min-h-screen bg-[#101216] text-zinc-100 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : ''
      }`}
    >
      {/* Top Header Bar */}
      <Header
        status={status}
        isLandscape={isLandscape}
        onToggleLandscape={() => setIsLandscape(!isLandscape)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {status === 'STOPPED' ? (
          /* ================= 1. SETUP / CONFIGURATION VIEW ================= */
          <div className="flex-1 flex flex-col gap-6">
            {/* Header Description */}
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Virtual Machine Setup</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select a distribution ISO image and configure virtual hardware parameters to boot your virtual system.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-cyan-400 self-start sm:self-auto">
                <Layers className="w-4 h-4" />
                <span>VirtIO KVM/Hardware Virtualization</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* PRIMARY GROUP: Search & Select ISO File */}
              <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <Disc className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">1. Search &amp; Select Linux ISO</h3>
                    <p className="text-[11px] text-zinc-400">Choose a distribution image to boot</p>
                  </div>
                </div>

                {/* ISO Search Field */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search distro (Pop!_OS, Alpine, Ubuntu, Debian, Arch)..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors placeholder-zinc-500"
                  />
                </div>

                {/* Browse Custom ISO Button */}
                <label className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-cyan-500 bg-zinc-950/60 flex items-center justify-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                  <FolderOpen className="w-4 h-4" />
                  <span>Browse Device Storage for Custom ISO (.iso)</span>
                  <input
                    type="file"
                    accept=".iso,application/x-iso9660-image"
                    onChange={handleCustomIsoUpload}
                    className="hidden"
                  />
                </label>

                {/* Selected ISO Display Banner */}
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedDistro.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{selectedDistro.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                          {selectedDistro.desktopEnv}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {selectedDistro.size} • {selectedDistro.arch} • Ready to Boot
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>

                {/* Distro Preset Grid */}
                <div className="space-y-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Preset Distributions
                  </span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredDistros.map((distro) => {
                      const isSelected = selectedDistro.id === distro.id;
                      return (
                        <div
                          key={distro.id}
                          onClick={() => handleSelectDistro(distro)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 border-cyan-500/80 shadow-md'
                              : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{distro.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-zinc-100">{distro.name}</p>
                              <p className="text-[11px] text-zinc-400">{distro.description}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 shrink-0">{distro.size}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECOND GROUP: Hardware & Virtual Disk (1, 3, 5 GB) */}
              <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">2. Hardware Configuration</h3>
                      <p className="text-[11px] text-zinc-400">RAM, CPU usage &amp; virtual disk size</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    {/* RAM Allocation: 1 GB, 2 GB, 4 GB */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                        <MemoryStick className="w-3.5 h-3.5 text-indigo-400" />
                        <span>RAM ALLOCATION</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1024, 2048, 4096].map((ram) => (
                          <button
                            key={ram}
                            type="button"
                            onClick={() => setConfig({ ...config, memoryMb: ram })}
                            className={`py-2 px-1 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                              config.memoryMb === ram
                                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {ram / 1024} GB {ram === 2048 && <span className="text-[10px] block font-sans text-zinc-500">(Rec)</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CPU Cores: 1, 2, 4 Cores */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PROCESSOR CORES</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 4].map((cores) => (
                          <button
                            key={cores}
                            type="button"
                            onClick={() => setConfig({ ...config, smpCores: cores })}
                            className={`py-2 px-1 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                              config.smpCores === cores
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {cores} {cores === 1 ? 'Core' : 'Cores'} {cores === 2 && <span className="text-[10px] block font-sans text-zinc-500">(Rec)</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Virtual Disk Size: 1 GB, 3 GB, or 5 GB as specified */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                        <span>VIRTUAL DISK SIZE (QCOW2)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 3, 5].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setConfig({ ...config, diskSizeGb: size })}
                            className={`py-2 px-1 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                              config.diskSizeGb === size
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {size} GB {size === 3 && <span className="text-[10px] block font-sans text-zinc-500">(Rec)</span>}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1.5">
                        VirtIO Block device formatted as QCOW2 dynamic image.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Launch Virtual Machine Action Button */}
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Power className="w-4 h-4" />
                  <span>BOOT DISTRO IN LANDSCAPE</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= 2. LIVE VIRTUAL MACHINE MONITOR ================= */
          <VirtualMachineView
            status={status}
            config={config}
            distro={selectedDistro}
            lines={lines}
            onSendCommand={handleSendCommand}
            onClear={handleClear}
            onStop={handleStop}
          />
        )}
      </main>
    </div>
  );
}

export default App;
