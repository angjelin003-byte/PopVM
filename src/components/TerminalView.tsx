import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine, VmStatus } from '../types';
import { Terminal as TermIcon, Trash2, ArrowDownCircle, Copy, Check } from 'lucide-react';

interface TerminalViewProps {
  lines: TerminalLine[];
  status: VmStatus;
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  lines,
  status,
  onSendCommand,
  onClear,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRunning = status === 'RUNNING';

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !isRunning) return;
    onSendCommand(inputVal);
    setInputVal('');
  };

  const handleCopyLogs = () => {
    const text = lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickCommands = [
    { label: 'help', cmd: 'help' },
    { label: 'uname -a', cmd: 'uname -a' },
    { label: 'lscpu', cmd: 'lscpu' },
    { label: 'free -h', cmd: 'free -h' },
    { label: 'df -h', cmd: 'df -h' },
    { label: 'qemu-info', cmd: 'qemu-info' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Terminal Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <TermIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-medium text-zinc-300">
            console: /dev/ttyAMA0 (PopVM Linux aarch64)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              autoScroll ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Auto-scroll"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-scroll</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-800 transition-colors"
            title="Copy Console Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-800 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto terminal-scrollbar space-y-1 bg-[#0d1117] min-h-[320px] max-h-[480px]"
      >
        {lines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-16">
            <TermIcon className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">QEMU Serial Terminal Inactive</p>
            <p className="text-xs mt-1 text-zinc-600">Click &apos;START LINUX&apos; above to boot the virtual machine.</p>
          </div>
        ) : (
          lines.map((line) => {
            let colorClass = 'text-zinc-300';
            if (line.type === 'cmd') colorClass = 'text-cyan-400 font-semibold';
            else if (line.type === 'kernel') colorClass = 'text-emerald-400/90';
            else if (line.type === 'init') colorClass = 'text-sky-400';
            else if (line.type === 'boot') colorClass = 'text-zinc-400';
            else if (line.type === 'success') colorClass = 'text-emerald-300';
            else if (line.type === 'error') colorClass = 'text-rose-400';
            else if (line.type === 'user') colorClass = 'text-amber-300 font-semibold';

            return (
              <div key={line.id} className={`leading-relaxed whitespace-pre-wrap break-all ${colorClass}`}>
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Command Chips */}
      {isRunning && (
        <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-zinc-500 font-mono text-[11px] whitespace-nowrap">Quick cmd:</span>
          {quickCommands.map((item) => (
            <button
              key={item.label}
              onClick={() => onSendCommand(item.cmd)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] border border-zinc-700 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Input Prompt */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-4 py-3 bg-zinc-900 border-t border-zinc-800 gap-2"
      >
        <span className="font-mono text-xs text-emerald-400 select-none">root@popvm:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={!isRunning}
          placeholder={isRunning ? "Type Linux command (or 'help') and press Enter..." : "VM is stopped"}
          className="flex-1 bg-transparent font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:cursor-not-allowed"
        />
        {isRunning && (
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="text-xs px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium transition-colors"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
};
