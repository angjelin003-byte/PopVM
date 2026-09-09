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

data class TerminalLine(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val type: TerminalLineType
)

data class QemuConfigOptions(
    var arch: String = "qemu-system-aarch64",
    var machine: String = "virt",
    var cpu: String = "max",
    var memoryMb: Int = 2048,
    var smpCores: Int = 2,
    var diskFile: String = "/data/user/0/com.example.popvm/files/linux.qcow2",
    var diskFormat: String = "qcow2",
    var isoFile: String = "/data/user/0/com.example.popvm/files/linux.iso",
    var bootOrder: String = "d",
    var nographic: Boolean = true
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
