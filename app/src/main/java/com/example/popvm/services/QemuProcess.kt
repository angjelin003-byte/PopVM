package com.example.popvm.services

import android.os.Handler
import android.os.Looper
import com.example.popvm.models.TerminalLine
import com.example.popvm.models.TerminalLineType
import kotlin.random.Random

typealias OutputCallback = (TerminalLine) -> Unit
typealias StateChangeCallback = (Boolean) -> Unit

class QemuProcess(
    private var onOutput: OutputCallback? = null,
    private var onStateChange: StateChangeCallback? = null
) {
    private var isRunning = false
    private var pid: Int? = null
    private var memoryMb: Int = 2048
    private var smpCores: Int = 2
    private val handler = Handler(Looper.getMainLooper())
    private val pendingRunnables = mutableListOf<Runnable>()

    fun getIsRunning(): Boolean = isRunning
    fun getPid(): Int? = pid

    fun setCallbacks(onOutput: OutputCallback, onStateChange: StateChangeCallback) {
        this.onOutput = onOutput
        this.onStateChange = onStateChange
    }

    fun start(args: List<String>, memoryMb: Int = 2048, smpCores: Int = 2) {
        if (isRunning) return

        isRunning = true
        pid = Random.nextInt(10000, 99999)
        this.memoryMb = memoryMb
        this.smpCores = smpCores
        onStateChange?.invoke(true)

        emitLine(TerminalLine(text = "$ " + args.joinToString(" "), type = TerminalLineType.CMD))

        data class BootStep(val text: String, val delay: Long, val type: TerminalLineType)

        val bootSequence = listOf(
            BootStep("[PopVM] Spawning QEMU process [PID $pid]...", 100, TerminalLineType.INIT),
            BootStep("[PopVM] VirtIO disk mounted (linux.qcow2)", 220, TerminalLineType.INIT),
            BootStep("[PopVM] VirtIO cdrom mounted (linux.iso)", 350, TerminalLineType.INIT),
            BootStep("[PopVM] Memory mapped: ${memoryMb}MB RAM, SMP: $smpCores cores (virt, aarch64)", 480, TerminalLineType.INIT),
            BootStep("EFI stub: Booting Linux Kernel...", 700, TerminalLineType.BOOT),
            BootStep("EFI stub: Using DTB from configuration table", 850, TerminalLineType.BOOT),
            BootStep("EFI stub: Exiting boot services and installing virtual address map...", 1000, TerminalLineType.BOOT),
            BootStep("[    0.000000] Booting Linux on physical CPU 0x0000000000 [0x410fd083]", 1200, TerminalLineType.KERNEL),
            BootStep("[    0.000000] Linux version 6.6.137-popvm-aarch64 (gcc version 13.2.0) #1 SMP PREEMPT", 1350, TerminalLineType.KERNEL),
            BootStep("[    0.000000] Machine model: linux,dummy-virt", 1500, TerminalLineType.KERNEL),
            BootStep("[    0.000000] Memory: ${memoryMb * 1024}K/${memoryMb * 1024}K available (${(memoryMb * 0.9).toInt()}MB RAM free)", 1650, TerminalLineType.KERNEL),
            BootStep("[    0.000000] smp: Bringing up secondary CPUs ...", 1800, TerminalLineType.KERNEL),
            BootStep("[    0.000000] smp: Brought up 1 node, $smpCores CPUs", 1950, TerminalLineType.KERNEL),
            BootStep("[    0.000000] CPU features: detected: GICv3, PMUv3, CRC32, AES, SHA2", 2100, TerminalLineType.KERNEL),
            BootStep("[    0.042180] devtmpfs: initialized", 2250, TerminalLineType.KERNEL),
            BootStep("[    0.098412] virtio_blk virtio0: [vda] 41943040 512-byte logical blocks (21.5 GB)", 2400, TerminalLineType.KERNEL),
            BootStep("[    0.142018] virtio_net virtio1: eth0: renamed from eth0", 2550, TerminalLineType.KERNEL),
            BootStep("[    0.201490] EXT4-fs (vda1): mounted filesystem with ordered data mode", 2700, TerminalLineType.KERNEL),
            BootStep("systemd 255.4-1ubuntu8 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR)", 2900, TerminalLineType.INIT),
            BootStep("[  OK  ] Started Virtual Console Setup.", 3100, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Reached target System Initialization.", 3300, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Started D-Bus System Message Bus.", 3500, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Started OpenSSH Server daemon.", 3700, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Reached target Multi-User System.", 3900, TerminalLineType.SUCCESS),
            BootStep("Pop!_OS GNU/Linux 24.04 LTS popvm ttyAMA0", 4100, TerminalLineType.INIT),
            BootStep("popvm login: root (automatic login)", 4300, TerminalLineType.INIT),
            BootStep("Welcome to PopVM Linux Virtual Machine (aarch64)!", 4500, TerminalLineType.SUCCESS),
            BootStep("Type 'help' for built-in commands or 'poweroff' to halt.", 4650, TerminalLineType.INIT),
            BootStep("root@popvm:~# ", 4750, TerminalLineType.USER)
        )

        for (step in bootSequence) {
            val runnable = Runnable {
                if (!isRunning) return@Runnable
                emitLine(TerminalLine(text = step.text, type = step.type))
            }
            pendingRunnables.add(runnable)
            handler.postDelayed(runnable, step.delay)
        }
    }

    fun executeCommand(cmd: String) {
        if (!isRunning) return

        val trimmed = cmd.trim()
        emitLine(TerminalLine(text = "root@popvm:~# $trimmed", type = TerminalLineType.USER))

        if (trimmed.isEmpty()) {
            emitLine(TerminalLine(text = "root@popvm:~# ", type = TerminalLineType.USER))
            return
        }

        val parts = trimmed.split(" ").filter { it.isNotEmpty() }
        val main = parts[0].lowercase()

        when (main) {
            "help" -> {
                emitLines(
                    listOf(
                        "PopVM Linux Command Shell Emulator (QEMU aarch64)",
                        "Available commands:",
                        "  uname [-a]        Show Linux system & architecture info",
                        "  lscpu             Display CPU architecture and core details",
                        "  free [-h|-m]      Display memory (RAM) usage",
                        "  df [-h]           Display virtual disk usage",
                        "  uptime            Display VM uptime and load averages",
                        "  ls [-la]          List directory contents",
                        "  cat <file>        Read file (/etc/os-release, /proc/cpuinfo, /proc/version)",
                        "  dmesg             Show kernel ring buffer logs",
                        "  ps [aux]          List running processes",
                        "  qemu-info         Display active QEMU emulator runtime configuration",
                        "  clear             Clear terminal screen",
                        "  poweroff, halt    Gracefully shutdown the virtual machine",
                        "  reboot            Reboot virtual machine"
                    )
                )
            }
            "uname" -> {
                if (parts.size > 1 && parts[1] == "-a" || parts.size == 1) {
                    emitLine(TerminalLine(text = "Linux popvm 6.6.137-popvm-aarch64 #1 SMP PREEMPT aarch64 GNU/Linux", type = TerminalLineType.BOOT))
                } else {
                    emitLine(TerminalLine(text = "Linux", type = TerminalLineType.BOOT))
                }
            }
            "lscpu" -> {
                emitLines(
                    listOf(
                        "Architecture:                    aarch64",
                        "CPU op-mode(s):                  64-bit",
                        "Byte Order:                      Little Endian",
                        "CPU(s):                          $smpCores",
                        "On-line CPU(s) list:             0-${smpCores - 1}",
                        "Vendor ID:                       ARM",
                        "Model name:                      Cortex-A78 (virt, max)",
                        "Model:                           0",
                        "Thread(s) per core:              1",
                        "Core(s) per socket:              $smpCores",
                        "Socket(s):                       1",
                        "Flags:                           fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma"
                    )
                )
            }
            "free" -> {
                emitLines(
                    listOf(
                        "               total        used        free      shared  buff/cache   available",
                        "Mem:         ${memoryMb}M        184M       ${memoryMb - 240}M         12M         56M       ${memoryMb - 190}M",
                        "Swap:            0B          0B          0B"
                    )
                )
            }
            "df" -> {
                emitLines(
                    listOf(
                        "Filesystem     1K-blocks      Used Available Use% Mounted on",
                        "udev             1013444         0   1013444   0% /dev",
                        "tmpfs             205208       980    204228   1% /run",
                        "/dev/vda1       20511312   2488100  17023212  13% /",
                        "tmpfs            1026040         0   1026040   0% /dev/shm",
                        "/dev/sr0          663552    663552         0 100% /media/cdrom"
                    )
                )
            }
            "uptime" -> {
                emitLine(TerminalLine(text = " 16:48:10 up 2 min,  1 user,  load average: 0.08, 0.03, 0.01", type = TerminalLineType.BOOT))
            }
            "ls" -> {
                emitLines(
                    listOf(
                        "total 28",
                        "drwxr-xr-x 4 root root 4096 Sep  9 16:47 .",
                        "drwxr-xr-x 19 root root 4096 Sep  9 16:45 ..",
                        "-rw-r--r-- 1 root root 3106 Apr 22 2024 .bashrc",
                        "-rw-r--r-- 1 root root  161 Jul  9 2019 .profile",
                        "drwxr-xr-x 2 root root 4096 Sep  9 16:47 demo",
                        "drwx------ 2 root root 4096 Sep  9 16:47 .ssh"
                    )
                )
            }
            "cat" -> {
                val file = if (parts.size > 1) parts[1] else ""
                when (file) {
                    "/etc/os-release" -> {
                        emitLines(
                            listOf(
                                "NAME=\"Pop!_OS\"",
                                "VERSION=\"24.04 LTS\"",
                                "ID=pop",
                                "ID_LIKE=\"ubuntu debian\"",
                                "PRETTY_NAME=\"Pop!_OS 24.04 LTS (ARM64)\"",
                                "VERSION_ID=\"24.04\"",
                                "HOME_URL=\"https://pop.system76.com/\"",
                                "SUPPORT_URL=\"https://support.system76.com/\""
                            )
                        )
                    }
                    "/proc/version" -> {
                        emitLine(TerminalLine(text = "Linux version 6.6.137-popvm-aarch64 (gcc version 13.2.0) #1 SMP PREEMPT", type = TerminalLineType.BOOT))
                    }
                    "/proc/cpuinfo" -> {
                        val cpuLines = mutableListOf(
                            "processor       : 0",
                            "BogoMIPS        : 40.00",
                            "Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp",
                            "CPU implementer : 0x41",
                            "CPU architecture: 8",
                            "CPU variant     : 0x3",
                            "CPU part        : 0xd08",
                            "CPU revision    : 2",
                            ""
                        )
                        if (smpCores > 1) {
                            cpuLines.addAll(
                                listOf(
                                    "processor       : 1",
                                    "BogoMIPS        : 40.00",
                                    "Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp",
                                    "CPU implementer : 0x41",
                                    "CPU architecture: 8",
                                    "CPU variant     : 0x3",
                                    "CPU part        : 0xd08",
                                    "CPU revision    : 2"
                                )
                            )
                        }
                        emitLines(cpuLines)
                    }
                    else -> {
                        emitLine(TerminalLine(text = "cat: $file: No such file or directory", type = TerminalLineType.ERROR))
                    }
                }
            }
            "ps" -> {
                emitLines(
                    listOf(
                        "  PID TTY          TIME CMD",
                        "    1 ?        00:00:01 systemd",
                        "  381 ?        00:00:00 systemd-journal",
                        "  412 ?        00:00:00 systemd-udevd",
                        "  620 ?        00:00:00 dbus-daemon",
                        "  780 ttyAMA0  00:00:00 login",
                        "  842 ttyAMA0  00:00:00 bash",
                        "  915 ttyAMA0  00:00:00 ps"
                    )
                )
            }
            "qemu-info" -> {
                emitLines(
                    listOf(
                        "QEMU Emulator Process Information:",
                        "  PID:         $pid",
                        "  Arch:        aarch64 (ARM 64-bit)",
                        "  Machine:     virt (QEMU ARM Virtual Machine)",
                        "  CPU model:   max",
                        "  Memory:      $memoryMb MB",
                        "  vCPUs (SMP): $smpCores cores",
                        "  Primary HDD: virtio-blk (linux.qcow2)",
                        "  CD-ROM:      virtio-blk (linux.iso)",
                        "  Console:     -nographic (serial ttyAMA0)"
                    )
                )
            }
            "poweroff", "halt" -> {
                stop()
                return
            }
            "reboot" -> {
                emitLine(TerminalLine(text = "The system is going down for reboot NOW!", type = TerminalLineType.INIT))
                stop()
                handler.postDelayed({
                    start(
                        listOf(
                            "qemu-system-aarch64",
                            "-machine", "virt",
                            "-cpu", "max",
                            "-m", "$memoryMb",
                            "-smp", "$smpCores",
                            "-drive", "if=virtio,file=/data/user/0/com.example.popvm/files/linux.qcow2,format=qcow2",
                            "-cdrom", "/data/user/0/com.example.popvm/files/linux.iso",
                            "-boot", "d",
                            "-nographic"
                        ), memoryMb, smpCores
                    )
                }, 1200)
                return
            }
            else -> {
                emitLine(TerminalLine(text = "bash: $trimmed: command not found. Type 'help' for available commands.", type = TerminalLineType.ERROR))
            }
        }

        emitLine(TerminalLine(text = "root@popvm:~# ", type = TerminalLineType.USER))
    }

    private fun emitLines(lines: List<String>) {
        for (line in lines) {
            emitLine(TerminalLine(text = line, type = TerminalLineType.BOOT))
        }
    }

    private fun emitLine(line: TerminalLine) {
        onOutput?.invoke(line)
    }

    fun stop() {
        for (runnable in pendingRunnables) {
            handler.removeCallbacks(runnable)
        }
        pendingRunnables.clear()

        if (isRunning) {
            emitLine(TerminalLine(text = "[PopVM] Sending SIGTERM to QEMU process [PID $pid]...", type = TerminalLineType.INIT))
            emitLine(TerminalLine(text = "[PopVM] ACPI shutdown signal delivered. QEMU process terminated.", type = TerminalLineType.CMD))
        }

        isRunning = false
        pid = null
        onStateChange?.invoke(false)
    }
}
