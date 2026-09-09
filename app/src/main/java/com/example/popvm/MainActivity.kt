package com.example.popvm

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.popvm.models.QemuConfigOptions
import com.example.popvm.models.TerminalLine
import com.example.popvm.models.TerminalLineType
import com.example.popvm.models.VmStatus
import com.example.popvm.services.QemuConfig
import com.example.popvm.services.VmController

class MainActivity : AppCompatActivity() {

    private lateinit var startButton: Button
    private lateinit var stopButton: Button
    private lateinit var statusText: TextView
    private lateinit var statusDot: android.view.View
    private lateinit var statusBadgeLayout: android.view.View
    private lateinit var consoleOutput: TextView
    private lateinit var terminalScroll: ScrollView
    private lateinit var etCommandInput: EditText
    private lateinit var btnSendCommand: ImageButton
    private lateinit var btnAutoScroll: ImageButton
    private lateinit var btnCopyLogs: ImageButton
    private lateinit var btnClearLogs: ImageButton
    private lateinit var btnOpenConfig: ImageButton
    private lateinit var btnModifyHardware: TextView

    private lateinit var tvMemoryMb: TextView
    private lateinit var tvSmpCores: TextView
    private lateinit var tvStorageInfo: TextView
    private lateinit var tvIsoInfo: TextView

    private val vmController = VmController()
    private var isAutoScroll = true
    private val rawTerminalLogs = StringBuilder()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupListeners()
        setupVmCallbacks()
        updateHardwareDisplay(vmController.getConfig())
        updateVmUi(VmStatus.STOPPED)
    }

    private fun initViews() {
        startButton = findViewById(R.id.startButton)
        stopButton = findViewById(R.id.stopButton)
        statusText = findViewById(R.id.statusText)
        statusDot = findViewById(R.id.statusDot)
        statusBadgeLayout = findViewById(R.id.statusBadgeLayout)
        consoleOutput = findViewById(R.id.consoleOutput)
        terminalScroll = findViewById(R.id.terminalScroll)
        etCommandInput = findViewById(R.id.etCommandInput)
        btnSendCommand = findViewById(R.id.btnSendCommand)
        btnAutoScroll = findViewById(R.id.btnAutoScroll)
        btnCopyLogs = findViewById(R.id.btnCopyLogs)
        btnClearLogs = findViewById(R.id.btnClearLogs)
        btnOpenConfig = findViewById(R.id.btnOpenConfig)
        btnModifyHardware = findViewById(R.id.btnModifyHardware)

        tvMemoryMb = findViewById(R.id.tvMemoryMb)
        tvSmpCores = findViewById(R.id.tvSmpCores)
        tvStorageInfo = findViewById(R.id.tvStorageInfo)
        tvIsoInfo = findViewById(R.id.tvIsoInfo)
    }

    private fun setupListeners() {
        startButton.setOnClickListener {
            vmController.start()
        }

        stopButton.setOnClickListener {
            vmController.stop()
        }

        btnOpenConfig.setOnClickListener {
            openConfigDialog()
        }

        btnModifyHardware.setOnClickListener {
            openConfigDialog()
        }

        btnAutoScroll.setOnClickListener {
            isAutoScroll = !isAutoScroll
            val tintColor = if (isAutoScroll) ContextCompat.getColor(this, R.color.cyan_accent) else ContextCompat.getColor(this, R.color.text_muted)
            btnAutoScroll.setColorFilter(tintColor)
            Toast.makeText(this, if (isAutoScroll) "Auto-scroll Enabled" else "Auto-scroll Disabled", Toast.LENGTH_SHORT).show()
        }

        btnCopyLogs.setOnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("PopVM Console Output", rawTerminalLogs.toString())
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Logs copied to clipboard", Toast.LENGTH_SHORT).show()
        }

        btnClearLogs.setOnClickListener {
            rawTerminalLogs.clear()
            consoleOutput.text = ""
        }

        btnSendCommand.setOnClickListener {
            submitCommand()
        }

        etCommandInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND || actionId == EditorInfo.IME_ACTION_DONE) {
                submitCommand()
                true
            } else {
                false
            }
        }

        // Quick Command Chips
        setupQuickChip(R.id.chipHelp, "help")
        setupQuickChip(R.id.chipUname, "uname -a")
        setupQuickChip(R.id.chipLscpu, "lscpu")
        setupQuickChip(R.id.chipFree, "free -h")
        setupQuickChip(R.id.chipDf, "df -h")
        setupQuickChip(R.id.chipQemuInfo, "qemu-info")
        setupQuickChip(R.id.chipReboot, "reboot")
        setupQuickChip(R.id.chipPoweroff, "poweroff")
    }

    private fun setupQuickChip(chipId: Int, cmd: String) {
        findViewById<TextView>(chipId)?.setOnClickListener {
            if (vmController.getStatus() != VmStatus.RUNNING) {
                Toast.makeText(this, "Start the VM first to send commands", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            vmController.sendCommand(cmd)
        }
    }

    private fun submitCommand() {
        val cmd = etCommandInput.text.toString().trim()
        if (cmd.isEmpty()) return

        if (vmController.getStatus() != VmStatus.RUNNING) {
            Toast.makeText(this, "Start the VM first to send commands", Toast.LENGTH_SHORT).show()
            return
        }

        if (cmd.equals("clear", ignoreCase = true)) {
            rawTerminalLogs.clear()
            consoleOutput.text = ""
            etCommandInput.setText("")
            return
        }

        vmController.sendCommand(cmd)
        etCommandInput.setText("")
    }

    private fun setupVmCallbacks() {
        vmController.setCallbacks(
            onStatusChange = { newStatus ->
                runOnUiThread {
                    updateVmUi(newStatus)
                }
            },
            onOutput = { line ->
                runOnUiThread {
                    appendTerminalLine(line)
                }
            }
        )
    }

    private fun appendTerminalLine(line: TerminalLine) {
        rawTerminalLogs.append(line.text).append("\n")

        val color = when (line.type) {
            TerminalLineType.CMD -> ContextCompat.getColor(this, R.color.term_cmd)
            TerminalLineType.KERNEL -> ContextCompat.getColor(this, R.color.term_kernel)
            TerminalLineType.INIT -> ContextCompat.getColor(this, R.color.term_init)
            TerminalLineType.USER -> ContextCompat.getColor(this, R.color.term_user)
            TerminalLineType.ERROR -> ContextCompat.getColor(this, R.color.term_error)
            TerminalLineType.SUCCESS -> ContextCompat.getColor(this, R.color.term_success)
            TerminalLineType.BOOT -> ContextCompat.getColor(this, R.color.term_boot)
        }

        val spannable = SpannableString(line.text + "\n")
        spannable.setSpan(
            ForegroundColorSpan(color),
            0,
            spannable.length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        consoleOutput.append(spannable)

        if (isAutoScroll) {
            terminalScroll.post {
                terminalScroll.fullScroll(ScrollView.FOCUS_DOWN)
            }
        }
    }

    private fun updateVmUi(status: VmStatus) {
        when (status) {
            VmStatus.STOPPED -> {
                startButton.isEnabled = true
                startButton.text = getString(R.string.start_linux)
                stopButton.isEnabled = false
                stopButton.text = getString(R.string.stop_linux)
                statusText.text = getString(R.string.vm_status_idle)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.text_muted)
                etCommandInput.isEnabled = false
                etCommandInput.hint = "VM is stopped"
            }
            VmStatus.STARTING -> {
                startButton.isEnabled = false
                startButton.text = getString(R.string.starting_linux)
                stopButton.isEnabled = false
                stopButton.text = getString(R.string.stop_linux)
                statusText.text = getString(R.string.vm_status_starting)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.amber_accent))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.amber_accent)
                etCommandInput.isEnabled = false
                etCommandInput.hint = "Booting kernel..."
            }
            VmStatus.RUNNING -> {
                startButton.isEnabled = false
                startButton.text = getString(R.string.start_linux)
                stopButton.isEnabled = true
                stopButton.text = getString(R.string.stop_linux)
                statusText.text = getString(R.string.vm_status_running)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.emerald_primary))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.emerald_primary)
                etCommandInput.isEnabled = true
                etCommandInput.hint = getString(R.string.cmd_input_hint)
            }
            VmStatus.STOPPING -> {
                startButton.isEnabled = false
                startButton.text = getString(R.string.start_linux)
                stopButton.isEnabled = false
                stopButton.text = getString(R.string.stopping_linux)
                statusText.text = getString(R.string.vm_status_stopping)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.orange_accent))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.orange_accent)
                etCommandInput.isEnabled = false
                etCommandInput.hint = "Halting VM..."
            }
        }
    }

    private fun updateHardwareDisplay(config: QemuConfigOptions) {
        tvMemoryMb.text = "${config.memoryMb} MB RAM"
        tvSmpCores.text = "${config.smpCores} vCPU Cores"
        tvStorageInfo.text = config.diskFile.substringAfterLast("/")
        tvIsoInfo.text = config.isoFile.substringAfterLast("/")
    }

    private fun openConfigDialog() {
        val dialog = ConfigDialog(
            this,
            vmController.getConfig(),
            vmController.getStatus()
        ) { updatedConfig ->
            vmController.setConfig(updatedConfig)
            updateHardwareDisplay(updatedConfig)
            Toast.makeText(this, "Hardware configuration updated", Toast.LENGTH_SHORT).show()
        }
        dialog.show()
    }
}
