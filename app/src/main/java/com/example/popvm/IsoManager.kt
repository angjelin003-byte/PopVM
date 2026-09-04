package com.example.popvm

import android.content.Context
import java.io.File

object IsoManager {

    fun getIso(context: Context): String {
        return File(context.filesDir, "linux.iso").absolutePath
    }
}
