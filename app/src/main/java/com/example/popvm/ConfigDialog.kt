package com.example.popvm

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.EditText
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import com.example.popvm.models.QemuConfigOptions
import com.example.popvm.models.VmStatus
import com.example.popvm.services.QemuConfig

class ConfigDialog(
    context: Context,
    private val currentConfig: QemuConfigOptions,
    private val vmStatus: VmStatus,
    private val onConfigSaved: (QemuConfigOptions) -> Unit
) : Dialog(context, R.style.Theme_PopVM) {

    private lateinit var rgMemory: RadioGroup
    private lateinit var rgCores: RadioGroup
    private lateinit var etIsoPath: EditText
    private lateinit var tvCliPreview: TextView
    private lateinit var tvRunningWarning: TextView
    private lateinit var btnApplyConfig: Button

    private var tempConfig = currentConfig.copy()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.dialog_config)

        window?.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        rgMemory = findViewById(R.id.rgMemory)
        rgCores = findViewById(R.id.rgCores)
        etIsoPath = findViewById(R.id.etIsoPath)
        tvCliPreview = findViewById(R.id.tvCliPreview)
        tvRunningWarning = findViewById(R.id.tvRunningWarning)
        btnApplyConfig = findViewById(R.id.btnApplyConfig)

        // Populate initial values
        when (tempConfig.memoryMb) {
            1024 -> findViewById<RadioButton>(R.id.rbRam1024).isChecked = true
            4096 -> findViewById<RadioButton>(R.id.rbRam4096).isChecked = true
            else -> findViewById<RadioButton>(R.id.rbRam2048).isChecked = true
        }

        when (tempConfig.smpCores) {
            1 -> findViewById<RadioButton>(R.id.rbCore1).isChecked = true
            4 -> findViewById<RadioButton>(R.id.rbCore4).isChecked = true
            else -> findViewById<RadioButton>(R.id.rbCore2).isChecked = true
        }

        etIsoPath.setText(tempConfig.isoFile)

        val isRunning = vmStatus != VmStatus.STOPPED
        if (isRunning) {
            tvRunningWarning.visibility = android.view.View.VISIBLE
            rgMemory.isEnabled = false
            rgCores.isEnabled = false
            etIsoPath.isEnabled = false
            for (i in 0 until rgMemory.childCount) {
                rgMemory.getChildAt(i).isEnabled = false
            }
            for (i in 0 until rgCores.childCount) {
                rgCores.getChildAt(i).isEnabled = false
            }
        }

        rgMemory.setOnCheckedChangeListener { _, checkedId ->
            tempConfig.memoryMb = when (checkedId) {
                R.id.rbRam1024 -> 1024
                R.id.rbRam4096 -> 4096
                else -> 2048
            }
            updateCliPreview()
        }

        rgCores.setOnCheckedChangeListener { _, checkedId ->
            tempConfig.smpCores = when (checkedId) {
                R.id.rbCore1 -> 1
                R.id.rbCore4 -> 4
                else -> 2
            }
            updateCliPreview()
        }

        etIsoPath.doAfterTextChanged { text ->
            tempConfig.isoFile = text?.toString() ?: ""
            updateCliPreview()
        }

        btnApplyConfig.setOnClickListener {
            onConfigSaved(tempConfig)
            dismiss()
        }

        updateCliPreview()
    }

    private fun updateCliPreview() {
        val args = QemuConfig.buildArgs(tempConfig)
        tvCliPreview.text = "$ " + args.joinToString(" ")
    }
}
