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
    private var distroName: String = "Pop!_OS 24.04 LTS"
    private var memoryMb: Int = 2048
    private var smpCores: Int = 2
    private var diskSizeGb: Int = 3
    private val handler = Handler(Looper.getMainLooper())
    private val pendingRunnables = mutableListOf<Runnable>()

    fun getIsRunning(): Boolean = isRunning
    fun getPid(): Int? = pid

    fun setCallbacks(onOutput: OutputCallback, onStateChange: StateChangeCallback) {
        this.onOutput = onOutput
        this.onStateChange = onStateChange
    }

    fun start(
        distroName: String,
        memoryMb: Int = 2048,
        smpCores: Int = 2,
        diskSizeGb: Int = 3,
        isoPath: String = ""
    ) {
        if (isRunning) return

        isRunning = true
        pid = Random.nextInt(10000, 99999)
        this.distroName = distroName
        this.memoryMb = memoryMb
        this.smpCores = smpCores
        this.diskSizeGb = diskSizeGb
        onStateChange?.invoke(true)

        val isoFilename = if (isoPath.isNotEmpty()) isoPath.substringAfterLast("/") else "linux.iso"
        emitLine(TerminalLine(text = "Booting virtual machine from $isoFilename...", type = TerminalLineType.CMD))

        data class BootStep(val text: String, val delay: Long, val type: TerminalLineType)

        val bootSequence = listOf(
            BootStep("Initializing Virtual Hardware (64-bit ARM virt)...", 80, TerminalLineType.INIT),
            BootStep("RAM: ${memoryMb} MB | Cores: $smpCores vCPU | Disk: $diskSizeGb GB Virtual Storage", 180, TerminalLineType.INIT),
            BootStep("Attached ISO: $isoFilename", 300, TerminalLineType.INIT),
            BootStep("VirtIO GPU Display Adapter: Active (1920x1080 Landscape)", 450, TerminalLineType.INIT),
            BootStep("EFI Stub: Loading Linux kernel image...", 650, TerminalLineType.BOOT),
            BootStep("EFI Stub: Mounting boot initramfs and virtual address map...", 850, TerminalLineType.BOOT),
            BootStep("[    0.000000] Booting Linux on physical CPU 0x0000000000", 1050, TerminalLineType.KERNEL),
            BootStep("[    0.000000] Linux version 6.6.137 (gcc 13.2.0) #1 SMP PREEMPT", 1200, TerminalLineType.KERNEL),
            BootStep("[    0.000000] Memory available: ${memoryMb * 1024}K (${memoryMb - 210}MB RAM free)", 1350, TerminalLineType.KERNEL),
            BootStep("[    0.000000] SMP: Initialized $smpCores virtual processor cores", 1500, TerminalLineType.KERNEL),
            BootStep("[    0.081240] virtio_blk virtio0: [vda] ${diskSizeGb * 2097152} 512-byte blocks (${diskSizeGb}.0 GB)", 1700, TerminalLineType.KERNEL),
            BootStep("[    0.142018] virtio_gpu: initialized KMS display framebuffer", 1850, TerminalLineType.KERNEL),
            BootStep("[    0.198412] virtio_net: eth0 network link ready", 2000, TerminalLineType.KERNEL),
            BootStep("systemd 255 running in graphical target mode", 2200, TerminalLineType.INIT),
            BootStep("[  OK  ] Started Graphical Display Manager (Wayland/X11).", 2400, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Mounted Virtual Storage Filesystem ($diskSizeGb GB).", 2600, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Started D-Bus System Message Bus.", 2800, TerminalLineType.SUCCESS),
            BootStep("[  OK  ] Reached target Graphical Desktop Environment.", 3000, TerminalLineType.SUCCESS),
            BootStep("Welcome to $distroName!", 3200, TerminalLineType.SUCCESS),
            BootStep("Desktop session is live in landscape mode. Terminal console is ready.", 3400, TerminalLineType.INIT),
            BootStep("root@popvm:~# ", 3500, TerminalLineType.USER)
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
                        "PopVM Linux Shell ($distroName)",
                        "Available commands:",
                        "  uname [-a]        Show Linux system info",
                        "  lscpu             Display processor cores & architecture",
                        "  free [-h|-m]      Display memory (RAM) allocation",
                        "  df [-h]           Display virtual disk ($diskSizeGb GB) usage",
                        "  uptime            Display VM uptime & load",
                        "  ls [-la]          List directory contents",
                        "  cat <file>        Read /etc/os-release or /proc/cpuinfo",
                        "  ps                List running processes & desktop manager",
                        "  clear             Clear terminal screen",
                        "  reboot            Reboot virtual machine",
                        "  poweroff, halt    Shutdown virtual machine"
                    )
                )
            }
            "uname" -> {
                emitLine(TerminalLine(text = "Linux popvm 6.6.137-popvm-arm64 #1 SMP PREEMPT aarch64 GNU/Linux", type = TerminalLineType.BOOT))
            }
            "lscpu" -> {
                emitLines(
                    listOf(
                        "Architecture:                    aarch64",
                        "CPU op-mode(s):                  64-bit",
                        "CPU(s):                          $smpCores",
                        "Model name:                      Cortex-A78 (Virtual CPU)",
                        "Core(s) per socket:              $smpCores",
                        "Socket(s):                       1",
                        "Flags:                           fp asimd aes pmull sha1 sha2 crc32 atomics"
                    )
                )
            }
            "free" -> {
                emitLines(
                    listOf(
                        "               total        used        free      shared  buff/cache   available",
                        "Mem:         ${memoryMb}M        240M       ${memoryMb - 320}M         16M         64M       ${memoryMb - 260}M",
                        "Swap:            0B          0B          0B"
                    )
                )
            }
            "df" -> {
                emitLines(
                    listOf(
                        "Filesystem     1K-blocks      Used Available Use% Mounted on",
                        "/dev/vda1        ${diskSizeGb * 1024 * 1024}    480000  ${(diskSizeGb * 1024 * 1024) - 480000}   12% /",
                        "tmpfs             205208       980    204228   1% /run",
                        "/dev/sr0         2800000   2800000         0 100% /media/cdrom"
                    )
                )
            }
            "uptime" -> {
                emitLine(TerminalLine(text = " 12:00:00 up 1 min,  1 user,  load average: 0.04, 0.02, 0.00", type = TerminalLineType.BOOT))
            }
            "ls" -> {
                emitLines(
                    listOf(
                        "Desktop  Documents  Downloads  Music  Pictures  Videos  installer.desktop"
                    )
                )
            }
            "cat" -> {
                val file = if (parts.size > 1) parts[1] else ""
                when (file) {
                    "/etc/os-release" -> {
                        emitLines(
                            listOf(
                                "NAME=\"$distroName\"",
                                "PRETTY_NAME=\"$distroName\"",
                                "ID=linux",
                                "VERSION_ID=\"24.04\"",
                                "HOME_URL=\"https://popvm.local\""
                            )
                        )
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
                        "  412 ?        00:00:00 cosmic-session",
                        "  520 ?        00:00:00 wayland-display",
                        "  780 ttyAMA0  00:00:00 bash",
                        "  890 ttyAMA0  00:00:00 ps"
                    )
                )
            }
            "poweroff", "halt" -> {
                stop()
                return
            }
            "reboot" -> {
                emitLine(TerminalLine(text = "Rebooting virtual machine...", type = TerminalLineType.INIT))
                stop()
                handler.postDelayed({
                    start(distroName, memoryMb, smpCores, diskSizeGb)
                }, 1000)
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
            emitLine(TerminalLine(text = "ACPI shutdown signal received. Virtual machine stopped.", type = TerminalLineType.INIT))
        }

        isRunning = false
        pid = null
        onStateChange?.invoke(false)
    }
}
