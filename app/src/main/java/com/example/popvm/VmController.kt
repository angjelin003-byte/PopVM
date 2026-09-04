package com.example.popvm

import android.content.Context

class VmController(private val context: Context) {

    private var qemu: QemuProcess? = null

    fun start() {
        if (qemu != null) return
        qemu = QemuProcess(context)
        qemu?.start(QemuConfig.default(context))
    }

    fun stop() {
        qemu?.stop()
        qemu = null
    }
}
