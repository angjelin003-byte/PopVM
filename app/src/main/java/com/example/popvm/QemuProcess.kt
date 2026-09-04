package com.example.popvm

import android.content.Context
import java.io.File

class QemuProcess(private val context: Context) {

    private var process: Process? = null

    fun start(args: List<String>) {
        val qemu = File(context.filesDir, "qemu-system-aarch64")
        process = ProcessBuilder(listOf(qemu.absolutePath) + args.drop(1))
            .redirectErrorStream(true)
            .start()
    }

    fun stop() {
        process?.destroy()
        process = null
    }
}
