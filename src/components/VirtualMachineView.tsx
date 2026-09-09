import { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Monitor,
  RotateCcw,
  Power,
  Folder,
  Activity,
  Globe,
  Settings,
  Send,
  Trash2,
  Copy,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react';
import { DistroPreset, QemuConfigOptions, TerminalLine, VmStatus } from '../types';

interface VirtualMachineViewProps {
  status: VmStatus;
  config: QemuConfigOptions;
  distro: DistroPreset;
  lines: TerminalLine[];
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
  onStop: () => void;
}

export function VirtualMachineView({
  status,
  config,
  distro,
  lines,
  onSendCommand,
  onClear,
  onStop
}: VirtualMachineViewProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'console'>('desktop');
  const [activeApp, setActiveApp] = useState<'terminal' | 'files' | 'system' | 'browser' | 'settings'>('terminal');
  const [inputVal, setInputVal] = useState('');
  const [desktopLogs, setDesktopLogs] = useState<string[]>([
    `[VirtIO KMS Framebuffer] Initialized 1920x1080 Landscape Display`,
    `[Session Active] Running ${distro.name} with ${distro.desktopEnv}`,
    `[Storage] Mounted /dev/vda1 (${config.diskSizeGb} GB Virtual Disk)`,
    `[Memory] Allocated ${config.memoryMb} MB RAM | ${config.smpCores} Processor Cores`
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const desktopEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    desktopEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [desktopLogs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendCommand(inputVal);
    setInputVal('');
  };

  const handleCopyLogs = () => {
    const text = lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDockClick = (app: 'terminal' | 'files' | 'system' | 'browser' | 'settings') => {
    setActiveApp(app);
    const appNames = {
      terminal: 'Terminal console',
      files: `File Manager (/home/user, ${config.diskSizeGb} GB virtual disk)`,
      system: `System Monitor (${config.smpCores} Cores @ 100%, ${config.memoryMb} MB RAM)`,
      browser: 'Web Browser (VirtIO Network Interface)',
      settings: 'Display Settings (1920x1080 Landscape 60Hz)'
    };
    setDesktopLogs((prev) => [...prev, `• Opened ${appNames[app]}`]);
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'cmd':
        return 'text-amber-400 font-semibold';
      case 'kernel':
        return 'text-cyan-400';
      case 'init':
        return 'text-indigo-300';
      case 'user':
        return 'text-emerald-400';
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'success':
        return 'text-emerald-300';
      case 'boot':
      default:
        return 'text-zinc-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top VM Control Header */}
      <div className="h-12 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{distro.icon}</span>
          <span className="text-sm font-semibold text-zinc-100 font-mono">{distro.name}</span>
          <span className="text-xs text-zinc-400 hidden sm:inline">({distro.desktopEnv})</span>
        </div>

        {/* Center Tabs: Graphical Desktop vs Serial Console */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Graphical Desktop</span>
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'console'
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Serial Console</span>
          </button>
        </div>

        {/* Right Machine Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSendCommand('reboot')}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs transition-colors cursor-pointer"
            title="Reboot Virtual Machine"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onStop}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Shutdown</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'desktop' ? (
        /* GRAPHICAL DESKTOP ENVIRONMENT */
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0b1c2b] via-[#0d1620] to-[#080d12] relative min-h-[460px] select-none">
          {/* Top Linux Panel */}
          <div className="h-7 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 px-4 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-zinc-100 hover:text-cyan-400 cursor-pointer">Activities</span>
              <span className="text-zinc-400 text-[11px] font-mono">{distro.name}</span>
            </div>
            <div className="font-medium text-[11px] text-zinc-300">
              12:00 PM • Virtual Machine Display
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span>100% 🔋</span>
              <span>📶 VirtIO</span>
              <span>🔊</span>
            </div>
          </div>

          {/* Desktop Workspace & Active Window */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center">
            {/* Active Window Card */}
            <div className="w-full max-w-4xl bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur flex flex-col h-[360px]">
              {/* Window Title Bar */}
              <div className="h-8 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-xs font-mono font-medium text-zinc-300 ml-2">
                    {activeApp === 'terminal' && `${distro.desktopEnv} Terminal (bash)`}
                    {activeApp === 'files' && 'File Manager - /home/user'}
                    {activeApp === 'system' && 'System Resource Monitor'}
                    {activeApp === 'browser' && 'Web Browser'}
                    {activeApp === 'settings' && 'Virtual Hardware & Display Settings'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">1920x1080 Landscape</span>
              </div>

              {/* Hardware Metric Bar */}
              <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-4 py-2 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-zinc-400">RAM:</span>
                  <span className="text-zinc-100 font-mono font-medium">{config.memoryMb} MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-zinc-400">CPU:</span>
                  <span className="text-zinc-100 font-mono font-medium">{config.smpCores} Cores</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-400">Disk:</span>
                  <span className="text-zinc-100 font-mono font-medium">{config.diskSizeGb} GB QCOW2</span>
                </div>
              </div>

              {/* Window Content Body */}
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-zinc-950">
                {activeApp === 'terminal' && (
                  <div className="space-y-1">
                    {desktopLogs.map((log, i) => (
                      <div key={i} className="text-zinc-300 leading-relaxed">
                        {log}
                      </div>
                    ))}
                    <div ref={desktopEndRef} />
                  </div>
                )}

                {activeApp === 'files' && (
                  <div className="grid grid-cols-4 gap-4 p-2 text-zinc-200">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer">
                      <Folder className="w-8 h-8 text-cyan-400 mb-1" />
                      <span className="text-xs">Desktop</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer">
                      <Folder className="w-8 h-8 text-cyan-400 mb-1" />
                      <span className="text-xs">Documents</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer">
                      <Folder className="w-8 h-8 text-cyan-400 mb-1" />
                      <span className="text-xs">Downloads</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer">
                      <Folder className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-xs">Pictures</span>
                    </div>
                  </div>
                )}

                {activeApp === 'system' && (
                  <div className="space-y-4 p-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">Processor Utilization ({config.smpCores} vCPUs)</span>
                        <span className="text-cyan-400 font-mono">14%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full w-[14%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">Memory Allocation ({config.memoryMb} MB)</span>
                        <span className="text-indigo-400 font-mono">312 MB / {config.memoryMb} MB</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[24%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">Virtual Disk Space ({config.diskSizeGb} GB)</span>
                        <span className="text-emerald-400 font-mono">480 MB / {config.diskSizeGb} GB</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[16%]" />
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'browser' && (
                  <div className="p-4 text-center text-zinc-400">
                    <Globe className="w-12 h-12 mx-auto text-cyan-400 mb-2 opacity-80" />
                    <p className="text-sm text-zinc-200 font-semibold">PopVM Web Link</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Virtual network bridged via virtio-net-pci (10.0.2.15/24)
                    </p>
                  </div>
                )}

                {activeApp === 'settings' && (
                  <div className="space-y-3 p-2 text-xs">
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Resolution</span>
                      <span className="text-zinc-100 font-mono">1920x1080 Landscape (60Hz)</span>
                    </div>
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Graphics Device</span>
                      <span className="text-zinc-100 font-mono">VirtIO-GPU KMS</span>
                    </div>
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">ISO Image</span>
                      <span className="text-zinc-100 font-mono truncate max-w-[200px]">{distro.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Linux Bottom App Dock Launcher */}
          <div className="pb-3 flex justify-center">
            <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur">
              <button
                onClick={() => handleDockClick('terminal')}
                className={`p-2.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                  activeApp === 'terminal' ? 'bg-zinc-800 border border-cyan-500/50 text-cyan-400' : 'text-zinc-300'
                }`}
                title="Terminal"
              >
                <TerminalIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDockClick('files')}
                className={`p-2.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                  activeApp === 'files' ? 'bg-zinc-800 border border-cyan-500/50 text-cyan-400' : 'text-zinc-300'
                }`}
                title="File Manager"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDockClick('system')}
                className={`p-2.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                  activeApp === 'system' ? 'bg-zinc-800 border border-cyan-500/50 text-cyan-400' : 'text-zinc-300'
                }`}
                title="System Resources"
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDockClick('browser')}
                className={`p-2.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                  activeApp === 'browser' ? 'bg-zinc-800 border border-cyan-500/50 text-cyan-400' : 'text-zinc-300'
                }`}
                title="Browser"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDockClick('settings')}
                className={`p-2.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                  activeApp === 'settings' ? 'bg-zinc-800 border border-cyan-500/50 text-cyan-400' : 'text-zinc-300'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SERIAL CONSOLE VIEW */
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          {/* Console Action Bar */}
          <div className="h-9 bg-zinc-900/60 border-b border-zinc-800/80 px-4 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Linux Serial Console (ttyAMA0)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Logs</span>
              </button>
              <button
                onClick={onClear}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Terminal Output Log */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 select-text">
            {lines.map((line) => (
              <div key={line.id} className={`${getLineClass(line.type)} leading-relaxed`}>
                {line.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Quick Command Chips */}
          <div className="px-3 py-1.5 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            {['help', 'uname -a', 'lscpu', 'free -h', 'df -h', 'uptime', 'ls -la', 'ps'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => onSendCommand(cmd)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 whitespace-nowrap transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Command Prompt Input */}
          <form onSubmit={handleSend} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400">root@popvm:~#</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type command (e.g. 'help', 'lscpu', 'df -h')..."
              className="flex-1 bg-transparent text-zinc-100 font-mono text-xs focus:outline-none placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={status !== 'RUNNING'}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-zinc-950 font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
