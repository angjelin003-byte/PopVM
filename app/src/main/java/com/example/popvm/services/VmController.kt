package com.example.popvm.services

import android.os.Handler
import android.os.Looper
import com.example.popvm.models.DisplayMode
import com.example.popvm.models.QemuConfigOptions
import com.example.popvm.models.TerminalLine
import com.example.popvm.models.VmStatus

class VmController(
    private var onStatusChange: ((VmStatus) -> Unit)? = null,
    private var onOutput: ((TerminalLine) -> Unit)? = null
) {
    private var qemu: QemuProcess? = null
    private var status: VmStatus = VmStatus.STOPPED
    private var config: QemuConfigOptions = QemuConfig.getDefaultOptions()
    private var displayMode: DisplayMode = DisplayMode.DESKTOP
    private val handler = Handler(Looper.getMainLooper())

    fun setCallbacks(onStatusChange: (VmStatus) -> Unit, onOutput: (TerminalLine) -> Unit) {
        this.onStatusChange = onStatusChange
        this.onOutput = onOutput
    }

    fun setConfig(options: QemuConfigOptions) {
        this.config = options
    }

    fun getConfig(): QemuConfigOptions = config

    fun getStatus(): VmStatus = status

    fun getDisplayMode(): DisplayMode = displayMode

    fun setDisplayMode(mode: DisplayMode) {
        this.displayMode = mode
    }

    fun start() {
        if (qemu != null) return

        setStatus(VmStatus.STARTING)

        qemu = QemuProcess(
            onOutput = { line ->
                onOutput?.invoke(line)
            },
            onStateChange = { running ->
                if (!running) {
                    setStatus(VmStatus.STOPPED)
                    qemu = null
                }
            }
        )

        qemu?.start(
            distroName = config.distroName,
            memoryMb = config.memoryMb,
            smpCores = config.smpCores,
            diskSizeGb = config.diskSizeGb,
            isoPath = config.isoFile
        )

        handler.postDelayed({
            if (status == VmStatus.STARTING) {
                setStatus(VmStatus.RUNNING)
            }
        }, 3400)
    }

    fun stop() {
        if (qemu == null) return
        setStatus(VmStatus.STOPPING)
        qemu?.stop()
        qemu = null
        setStatus(VmStatus.STOPPED)
    }

    fun sendCommand(cmd: String) {
        qemu?.executeCommand(cmd)
    }

    private fun setStatus(newStatus: VmStatus) {
        status = newStatus
        onStatusChange?.invoke(newStatus)
    }
}
