package com.example.popvm.services

import com.example.popvm.models.DiskInfo

object StorageManager {
    private const val DEFAULT_PATH = "/data/user/0/com.example.popvm/files/linux.qcow2"

    fun getDisk(): String = DEFAULT_PATH

    fun getDiskInfo(): DiskInfo {
        return DiskInfo(
            name = "linux.qcow2",
            path = DEFAULT_PATH,
            format = "qcow2",
            virtualSize = "20 GB",
            actualSize = "2.4 GB",
            status = "Ready"
        )
    }
}
