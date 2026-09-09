package com.example.popvm.services

import com.example.popvm.models.QemuConfigOptions

object QemuConfig {
    fun getDefaultOptions(): QemuConfigOptions {
        return QemuConfigOptions(
            arch = "qemu-system-aarch64",
            machine = "virt",
            cpu = "max",
            memoryMb = 2048,
            smpCores = 2,
            diskFile = StorageManager.getDisk(),
            diskFormat = "qcow2",
            isoFile = IsoManager.getIso(),
            bootOrder = "d",
            nographic = true
        )
    }

    fun buildArgs(options: QemuConfigOptions = getDefaultOptions()): List<String> {
        val iso = if (options.isoFile.isNotEmpty()) options.isoFile else IsoManager.getIso()
        val disk = if (options.diskFile.isNotEmpty()) options.diskFile else StorageManager.getDisk()

        val args = mutableListOf(
            options.arch.ifEmpty { "qemu-system-aarch64" },
            "-machine", options.machine.ifEmpty { "virt" },
            "-cpu", options.cpu.ifEmpty { "max" },
            "-m", "${options.memoryMb}",
            "-smp", "${options.smpCores}",
            "-drive", "if=virtio,file=$disk,format=${options.diskFormat.ifEmpty { "qcow2" }}",
            "-cdrom", iso,
            "-boot", options.bootOrder.ifEmpty { "d" }
        )
        if (options.nographic) {
            args.add("-nographic")
        }
        return args
    }
}
