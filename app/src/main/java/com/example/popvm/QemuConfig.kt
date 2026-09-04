package com.example.popvm

import android.content.Context

object QemuConfig {

    fun default(context: Context): List<String> {
        val iso = IsoManager.getIso(context)
        val disk = StorageManager.getDisk(context)

        return listOf(
            "qemu-system-aarch64",
            "-machine", "virt",
            "-cpu", "max",
            "-m", "2048",
            "-smp", "2",
            "-drive", "if=virtio,file=$disk,format=qcow2",
            "-cdrom", iso,
            "-boot", "d",
            "-nographic"
        )
    }
}
