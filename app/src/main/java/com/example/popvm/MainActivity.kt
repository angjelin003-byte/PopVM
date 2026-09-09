package com.example.popvm

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var startButton: Button
    private lateinit var stopButton: Button
    private lateinit var statusText: TextView
    private lateinit var consoleOutput: TextView

    private var isVmRunning = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        startButton = findViewById(R.id.startButton)
        stopButton = findViewById(R.id.stopButton)
        statusText = findViewById(R.id.statusText)
        consoleOutput = findViewById(R.id.consoleOutput)

        startButton.setOnClickListener {
            startLinuxVm()
        }

        stopButton.setOnClickListener {
            stopLinuxVm()
        }
    }

    private fun startLinuxVm() {
        isVmRunning = true
        startButton.isEnabled = false
        stopButton.isEnabled = true
        statusText.text = getString(R.string.vm_status_running)
        appendLog("[VM] Starting QEMU aarch64 emulation (virt, 2048 MB RAM, 2 vCPUs)...")
        appendLog("[VM] Linux kernel boot parameters: console=ttyAMA0 earlycon root=/dev/vda rw")
        appendLog("[VM] Initializing VirtIO storage & serial console...")
    }

    private fun stopLinuxVm() {
        isVmRunning = false
        startButton.isEnabled = true
        stopButton.isEnabled = false
        statusText.text = getString(R.string.vm_status_idle)
        appendLog("[VM] Sending ACPI shutdown signal...")
        appendLog("[VM] QEMU process terminated.")
    }

    private fun appendLog(message: String) {
        val currentText = consoleOutput.text.toString()
        consoleOutput.text = "$currentText\n$message"
    }
}
