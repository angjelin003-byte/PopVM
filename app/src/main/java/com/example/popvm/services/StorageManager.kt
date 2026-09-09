package com.example.popvm.services

import com.example.popvm.models.DiskInfo

object StorageManager {
    private const val DEFAULT_PATH = "/data/user/0/com.example.popvm/files/linux.qcow2"

    val DISK_SIZE_OPTIONS = listOf(1, 3, 5) // 1 GB, 3 GB, 5 GB as requested

    fun getDisk(): String = DEFAULT_PATH

    fun getDiskInfo(sizeGb: Int = 3): DiskInfo {
        val actualSize = when (sizeGb) {
            1 -> "480 MB"
            3 -> "1.2 GB"
            5 -> "1.9 GB"
            else -> "1.2 GB"
        }
        return DiskInfo(
            name = "linux.qcow2",
            path = DEFAULT_PATH,
            format = "qcow2",
            virtualSize = "$sizeGb GB",
            actualSize = actualSize,
            status = "Formatted & Ready"
        )
    }
}
