package com.example.popvm.services

import com.example.popvm.models.IsoInfo

object IsoManager {
    private const val DEFAULT_PATH = "/data/user/0/com.example.popvm/files/linux.iso"

    fun getIso(): String = DEFAULT_PATH

    fun getIsoInfo(): IsoInfo {
        return IsoInfo(
            name = "linux.iso",
            path = DEFAULT_PATH,
            size = "648 MB",
            arch = "ARM64 (aarch64)",
            status = "Attached"
        )
    }
}
