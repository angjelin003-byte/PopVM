package com.example.popvm.models

import java.util.UUID

enum class VmStatus {
    STOPPED,
    STARTING,
    RUNNING,
    STOPPING
}

enum class TerminalLineType {
    CMD,
    BOOT,
    KERNEL,
    INIT,
    USER,
    ERROR,
    SUCCESS
}

enum class DisplayMode {
    DESKTOP,
    CONSOLE
}

data class DistroPreset(
    val id: String,
    val name: String,
    val description: String,
    val desktopEnv: String,
    val size: String,
    val arch: String = "ARM64 (aarch64)",
    val defaultIsoPath: String
)

data class TerminalLine(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val type: TerminalLineType
)

data class QemuConfigOptions(
    var arch: String = "aarch64",
    var machine: String = "virt",
    var cpu: String = "max",
    var memoryMb: Int = 2048,
    var smpCores: Int = 2,
    var diskSizeGb: Int = 3,
    var diskFile: String = "/data/user/0/com.example.popvm/files/linux.qcow2",
    var diskFormat: String = "qcow2",
    var distroName: String = "Pop!_OS 24.04 LTS (COSMIC Desktop)",
    var isoFile: String = "/data/user/0/com.example.popvm/files/pop-os-arm64.iso",
    var bootOrder: String = "d",
    var nographic: Boolean = false
)

data class DiskInfo(
    val name: String,
    val path: String,
    val format: String,
    val virtualSize: String,
    val actualSize: String,
    val status: String
)

data class IsoInfo(
    val name: String,
    val path: String,
    val size: String,
    val arch: String,
    val status: String
)
