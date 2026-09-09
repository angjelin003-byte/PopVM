package com.example.popvm.services

import com.example.popvm.models.QemuConfigOptions

object QemuConfig {
    fun getDefaultOptions(): QemuConfigOptions {
        val defaultDistro = IsoManager.getDefaultIso()
        return QemuConfigOptions(
            arch = "aarch64",
            machine = "virt",
            cpu = "max",
            memoryMb = 2048,
            smpCores = 2,
            diskSizeGb = 3,
            diskFile = StorageManager.getDisk(),
            diskFormat = "qcow2",
            distroName = defaultDistro.name,
            isoFile = defaultDistro.defaultIsoPath,
            bootOrder = "d",
            nographic = false
        )
    }

    fun buildArgs(options: QemuConfigOptions = getDefaultOptions()): List<String> {
        val iso = options.isoFile.ifEmpty { IsoManager.getDefaultIso().defaultIsoPath }
        val disk = options.diskFile.ifEmpty { StorageManager.getDisk() }

        val args = mutableListOf(
            "qemu-system-aarch64",
            "-machine", options.machine.ifEmpty { "virt" },
            "-cpu", options.cpu.ifEmpty { "max" },
            "-m", "${options.memoryMb}",
            "-smp", "${options.smpCores}",
            "-drive", "if=virtio,file=$disk,format=${options.diskFormat.ifEmpty { "qcow2" }}",
            "-cdrom", iso,
            "-boot", options.bootOrder.ifEmpty { "d" },
            "-device", "virtio-gpu-pci",
            "-display", "default"
        )
        return args
    }
}
