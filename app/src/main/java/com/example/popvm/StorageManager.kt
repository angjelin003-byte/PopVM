package com.example.popvm

import android.content.Context
import java.io.File

object StorageManager {

    fun getDisk(context: Context): String {
        return File(context.filesDir, "linux.qcow2").absolutePath
    }
}
