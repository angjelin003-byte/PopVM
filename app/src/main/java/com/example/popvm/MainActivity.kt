package com.example.popvm

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.ActivityInfo
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.RadioGroup
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import com.example.popvm.models.DistroPreset
import com.example.popvm.models.QemuConfigOptions
import com.example.popvm.models.TerminalLine
import com.example.popvm.models.TerminalLineType
import com.example.popvm.models.VmStatus
import com.example.popvm.services.IsoManager
import com.example.popvm.services.StorageManager
import com.example.popvm.services.VmController

class MainActivity : AppCompatActivity() {

    // Containers
    private lateinit var layoutVmSetup: View
    private lateinit var layoutVmMonitor: View
    private lateinit var layoutDesktopView: View
    private lateinit var layoutConsoleView: View

    // Setup Section Views
    private lateinit var etSearchIso: EditText
    private lateinit var btnBrowseIso: Button
    private lateinit var tvSelectedDistroName: TextView
    private lateinit var tvSelectedDistroDetails: TextView
    private lateinit var cardDistroPopOs: View
    private lateinit var cardDistroAlpine: View
    private lateinit var cardDistroUbuntu: View
    private lateinit var cardDistroDebian: View
    private lateinit var startButton: Button

    // Hardware Options
    private lateinit var rgRamOptions: RadioGroup
    private lateinit var rgCpuOptions: RadioGroup
    private lateinit var rgDiskOptions: RadioGroup

    // Top Header & Status
    private lateinit var statusText: TextView
    private lateinit var statusDot: View
    private lateinit var btnRotateScreen: ImageButton

    // Monitor & Desktop Views
    private lateinit var tvMonitorDistroTitle: TextView
    private lateinit var btnTabDesktop: Button
    private lateinit var btnTabConsole: Button
    private lateinit var btnVmReboot: ImageButton
    private lateinit var stopButton: Button

    private lateinit var tvActiveWindowTitle: TextView
    private lateinit var tvDesktopRamLive: TextView
    private lateinit var tvDesktopCpuLive: TextView
    private lateinit var tvDesktopDiskLive: TextView
    private lateinit var desktopConsoleOutput: TextView
    private lateinit var desktopTerminalScroll: ScrollView

    // Dock Apps
    private lateinit var dockTerminal: TextView
    private lateinit var dockFiles: TextView
    private lateinit var dockSystem: TextView
    private lateinit var dockBrowser: TextView
    private lateinit var dockSettings: TextView

    // Console Views
    private lateinit var consoleOutput: TextView
    private lateinit var terminalScroll: ScrollView
    private lateinit var etCommandInput: EditText
    private lateinit var btnSendCommand: ImageButton
    private lateinit var btnCopyLogs: Button
    private lateinit var btnClearLogs: Button

    // State
    private val vmController = VmController()
    private var selectedDistro: DistroPreset = IsoManager.getDefaultIso()
    private var isLandscape = false
    private val rawTerminalLogs = StringBuilder()

    // SAF ISO File Picker
    private val pickIsoLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let { handleSelectedIsoUri(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupIsoSelection()
        setupHardwareSelection()
        setupVmControls()
        setupDesktopDock()
        setupConsole()
        setupRotation()
        setupVmCallbacks()

        updateDistroSelectionDisplay()
        updateVmUi(VmStatus.STOPPED)
    }

    private fun initViews() {
        layoutVmSetup = findViewById(R.id.layoutVmSetup)
        layoutVmMonitor = findViewById(R.id.layoutVmMonitor)
        layoutDesktopView = findViewById(R.id.layoutDesktopView)
        layoutConsoleView = findViewById(R.id.layoutConsoleView)

        etSearchIso = findViewById(R.id.etSearchIso)
        btnBrowseIso = findViewById(R.id.btnBrowseIso)
        tvSelectedDistroName = findViewById(R.id.tvSelectedDistroName)
        tvSelectedDistroDetails = findViewById(R.id.tvSelectedDistroDetails)
        cardDistroPopOs = findViewById(R.id.cardDistroPopOs)
        cardDistroAlpine = findViewById(R.id.cardDistroAlpine)
        cardDistroUbuntu = findViewById(R.id.cardDistroUbuntu)
        cardDistroDebian = findViewById(R.id.cardDistroDebian)
        startButton = findViewById(R.id.startButton)

        rgRamOptions = findViewById(R.id.rgRamOptions)
        rgCpuOptions = findViewById(R.id.rgCpuOptions)
        rgDiskOptions = findViewById(R.id.rgDiskOptions)

        statusText = findViewById(R.id.statusText)
        statusDot = findViewById(R.id.statusDot)
        btnRotateScreen = findViewById(R.id.btnRotateScreen)

        tvMonitorDistroTitle = findViewById(R.id.tvMonitorDistroTitle)
        btnTabDesktop = findViewById(R.id.btnTabDesktop)
        btnTabConsole = findViewById(R.id.btnTabConsole)
        btnVmReboot = findViewById(R.id.btnVmReboot)
        stopButton = findViewById(R.id.stopButton)

        tvActiveWindowTitle = findViewById(R.id.tvActiveWindowTitle)
        tvDesktopRamLive = findViewById(R.id.tvDesktopRamLive)
        tvDesktopCpuLive = findViewById(R.id.tvDesktopCpuLive)
        tvDesktopDiskLive = findViewById(R.id.tvDesktopDiskLive)
        desktopConsoleOutput = findViewById(R.id.desktopConsoleOutput)
        desktopTerminalScroll = findViewById(R.id.desktopTerminalScroll)

        dockTerminal = findViewById(R.id.dockTerminal)
        dockFiles = findViewById(R.id.dockFiles)
        dockSystem = findViewById(R.id.dockSystem)
        dockBrowser = findViewById(R.id.dockBrowser)
        dockSettings = findViewById(R.id.dockSettings)

        consoleOutput = findViewById(R.id.consoleOutput)
        terminalScroll = findViewById(R.id.terminalScroll)
        etCommandInput = findViewById(R.id.etCommandInput)
        btnSendCommand = findViewById(R.id.btnSendCommand)
        btnCopyLogs = findViewById(R.id.btnCopyLogs)
        btnClearLogs = findViewById(R.id.btnClearLogs)
    }

    private fun setupIsoSelection() {
        btnBrowseIso.setOnClickListener {
            try {
                pickIsoLauncher.launch("*/*")
            } catch (e: Exception) {
                Toast.makeText(this, "Opening file picker...", Toast.LENGTH_SHORT).show()
            }
        }

        etSearchIso.doAfterTextChanged { text ->
            val query = text?.toString() ?: ""
            filterDistros(query)
        }

        cardDistroPopOs.setOnClickListener { selectDistro(IsoManager.PRESET_DISTROS[0]) }
        cardDistroAlpine.setOnClickListener { selectDistro(IsoManager.PRESET_DISTROS[1]) }
        cardDistroUbuntu.setOnClickListener { selectDistro(IsoManager.PRESET_DISTROS[2]) }
        cardDistroDebian.setOnClickListener { selectDistro(IsoManager.PRESET_DISTROS[3]) }
    }

    private fun filterDistros(query: String) {
        val q = query.lowercase().trim()
        cardDistroPopOs.visibility = if ("pop!_os".contains(q) || "cosmic".contains(q) || q.isEmpty()) View.VISIBLE else View.GONE
        cardDistroAlpine.visibility = if ("alpine".contains(q) || "xfce".contains(q) || q.isEmpty()) View.VISIBLE else View.GONE
        cardDistroUbuntu.visibility = if ("ubuntu".contains(q) || "gnome".contains(q) || q.isEmpty()) View.VISIBLE else View.GONE
        cardDistroDebian.visibility = if ("debian".contains(q) || "bookworm".contains(q) || q.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun selectDistro(distro: DistroPreset) {
        selectedDistro = distro
        updateDistroSelectionDisplay()
        Toast.makeText(this, "Selected: ${distro.name}", Toast.LENGTH_SHORT).show()
    }

    private fun handleSelectedIsoUri(uri: Uri) {
        var filename = "custom-linux.iso"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1) {
                    filename = cursor.getString(nameIndex)
                }
            }
        }

        val customDistro = DistroPreset(
            id = "custom",
            name = filename.removeSuffix(".iso").replace("-", " ").capitalize(),
            description = "Custom ISO image from device storage",
            desktopEnv = "Linux Desktop",
            size = "Custom File",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = uri.toString()
        )
        selectedDistro = customDistro
        updateDistroSelectionDisplay()
        Toast.makeText(this, "Loaded custom ISO: $filename", Toast.LENGTH_SHORT).show()
    }

    private fun updateDistroSelectionDisplay() {
        tvSelectedDistroName.text = "${selectedDistro.name} (${selectedDistro.desktopEnv})"
        tvSelectedDistroDetails.text = "${selectedDistro.size} • ${selectedDistro.arch} • Ready to Boot"
    }

    private fun setupHardwareSelection() {
        // RAM Selection: 1GB, 2GB, 4GB
        rgRamOptions.setOnCheckedChangeListener { _, checkedId ->
            val ram = when (checkedId) {
                R.id.rbRam1Gb -> 1024
                R.id.rbRam4Gb -> 4096
                else -> 2048
            }
            val current = vmController.getConfig()
            current.memoryMb = ram
            vmController.setConfig(current)
        }

        // CPU Cores: 1, 2, 4
        rgCpuOptions.setOnCheckedChangeListener { _, checkedId ->
            val cores = when (checkedId) {
                R.id.rbCpu1Core -> 1
                R.id.rbCpu4Cores -> 4
                else -> 2
            }
            val current = vmController.getConfig()
            current.smpCores = cores
            vmController.setConfig(current)
        }

        // Virtual Disk Size: 1 GB, 3 GB, or 5 GB as requested
        rgDiskOptions.setOnCheckedChangeListener { _, checkedId ->
            val sizeGb = when (checkedId) {
                R.id.rbDisk1Gb -> 1
                R.id.rbDisk5Gb -> 5
                else -> 3
            }
            val current = vmController.getConfig()
            current.diskSizeGb = sizeGb
            vmController.setConfig(current)
        }
    }

    private fun setupVmControls() {
        startButton.setOnClickListener {
            val config = vmController.getConfig()
            config.distroName = selectedDistro.name
            config.isoFile = selectedDistro.defaultIsoPath
            vmController.setConfig(config)

            // Switch to landscape orientation for full machine execution
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            isLandscape = true

            vmController.start()
        }

        stopButton.setOnClickListener {
            vmController.stop()
        }

        btnVmReboot.setOnClickListener {
            if (vmController.getStatus() == VmStatus.RUNNING) {
                vmController.sendCommand("reboot")
            }
        }

        btnTabDesktop.setOnClickListener {
            showDesktopTab()
        }

        btnTabConsole.setOnClickListener {
            showConsoleTab()
        }
    }

    private fun showDesktopTab() {
        layoutDesktopView.visibility = View.VISIBLE
        layoutConsoleView.visibility = View.GONE
        btnTabDesktop.setBackgroundColor(ContextCompat.getColor(this, R.color.cyan_accent))
        btnTabDesktop.setTextColor(ContextCompat.getColor(this, R.color.bg_dark))
        btnTabConsole.setBackgroundColor(ContextCompat.getColor(this, R.color.surface_dark))
        btnTabConsole.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
    }

    private fun showConsoleTab() {
        layoutDesktopView.visibility = View.GONE
        layoutConsoleView.visibility = View.VISIBLE
        btnTabConsole.setBackgroundColor(ContextCompat.getColor(this, R.color.cyan_accent))
        btnTabConsole.setTextColor(ContextCompat.getColor(this, R.color.bg_dark))
        btnTabDesktop.setBackgroundColor(ContextCompat.getColor(this, R.color.surface_dark))
        btnTabDesktop.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
    }

    private fun setupDesktopDock() {
        dockTerminal.setOnClickListener {
            tvActiveWindowTitle.text = "COSMIC Terminal (tty1)"
            appendDesktopLog("Opening Terminal application inside ${selectedDistro.name}...")
        }
        dockFiles.setOnClickListener {
            tvActiveWindowTitle.text = "File Manager (/home/user)"
            appendDesktopLog("Opened File Manager: /home/user (ext4 filesystem, ${vmController.getConfig().diskSizeGb} GB virtual disk)")
        }
        dockSystem.setOnClickListener {
            tvActiveWindowTitle.text = "System Monitor & Hardware Resources"
            appendDesktopLog("System Monitor: ${vmController.getConfig().smpCores} Cores active @ 100%, RAM allocation: ${vmController.getConfig().memoryMb} MB")
        }
        dockBrowser.setOnClickListener {
            tvActiveWindowTitle.text = "Web Browser (PopVM Network Link)"
            appendDesktopLog("Browser active on VirtIO eth0 virtual network.")
        }
        dockSettings.setOnClickListener {
            tvActiveWindowTitle.text = "Desktop Environment Settings"
            appendDesktopLog("Display Resolution: 1920x1080 Landscape (VirtIO KMS Framebuffer)")
        }
    }

    private fun appendDesktopLog(text: String) {
        desktopConsoleOutput.append("\n• $text")
        desktopTerminalScroll.post {
            desktopTerminalScroll.fullScroll(ScrollView.FOCUS_DOWN)
        }
    }

    private fun setupConsole() {
        btnCopyLogs.setOnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("PopVM Logs", rawTerminalLogs.toString())
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Console logs copied to clipboard", Toast.LENGTH_SHORT).show()
        }

        btnClearLogs.setOnClickListener {
            rawTerminalLogs.clear()
            consoleOutput.text = ""
        }

        btnSendCommand.setOnClickListener { submitCommand() }

        etCommandInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND || actionId == EditorInfo.IME_ACTION_DONE) {
                submitCommand()
                true
            } else false
        }

        setupQuickChip(R.id.chipHelp, "help")
        setupQuickChip(R.id.chipUname, "uname -a")
        setupQuickChip(R.id.chipLscpu, "lscpu")
        setupQuickChip(R.id.chipFree, "free -h")
        setupQuickChip(R.id.chipDf, "df -h")
        setupQuickChip(R.id.chipUptime, "uptime")
        setupQuickChip(R.id.chipLs, "ls -la")
    }

    private fun setupQuickChip(chipId: Int, cmd: String) {
        findViewById<TextView>(chipId)?.setOnClickListener {
            if (vmController.getStatus() != VmStatus.RUNNING) {
                Toast.makeText(this, "VM is not running", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            vmController.sendCommand(cmd)
        }
    }

    private fun submitCommand() {
        val cmd = etCommandInput.text.toString().trim()
        if (cmd.isEmpty()) return

        if (vmController.getStatus() != VmStatus.RUNNING) {
            Toast.makeText(this, "Start the VM first to run commands", Toast.LENGTH_SHORT).show()
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

    private fun setupRotation() {
        btnRotateScreen.setOnClickListener {
            isLandscape = !isLandscape
            requestedOrientation = if (isLandscape) {
                ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            } else {
                ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            }
            Toast.makeText(this, if (isLandscape) "Landscape Mode" else "Portrait Mode", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupVmCallbacks() {
        vmController.setCallbacks(
            onStatusChange = { status ->
                runOnUiThread {
                    updateVmUi(status)
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
        desktopConsoleOutput.append(spannable)

        terminalScroll.post { terminalScroll.fullScroll(ScrollView.FOCUS_DOWN) }
        desktopTerminalScroll.post { desktopTerminalScroll.fullScroll(ScrollView.FOCUS_DOWN) }
    }

    private fun updateVmUi(status: VmStatus) {
        val config = vmController.getConfig()
        tvMonitorDistroTitle.text = "${selectedDistro.name} (${selectedDistro.desktopEnv})"
        tvDesktopRamLive.text = "RAM: ${config.memoryMb} MB"
        tvDesktopCpuLive.text = "CPU: ${config.smpCores} Cores"
        tvDesktopDiskLive.text = "Disk: ${config.diskSizeGb} GB (QCOW2)"

        when (status) {
            VmStatus.STOPPED -> {
                layoutVmSetup.visibility = View.VISIBLE
                layoutVmMonitor.visibility = View.GONE

                startButton.isEnabled = true
                startButton.text = getString(R.string.launch_vm)
                stopButton.isEnabled = false

                statusText.text = getString(R.string.vm_status_idle)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.emerald_primary)
            }
            VmStatus.STARTING -> {
                layoutVmSetup.visibility = View.GONE
                layoutVmMonitor.visibility = View.VISIBLE

                startButton.isEnabled = false
                stopButton.isEnabled = false

                statusText.text = getString(R.string.vm_status_starting)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.amber_accent))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.amber_accent)
            }
            VmStatus.RUNNING -> {
                layoutVmSetup.visibility = View.GONE
                layoutVmMonitor.visibility = View.VISIBLE

                startButton.isEnabled = false
                stopButton.isEnabled = true

                statusText.text = getString(R.string.vm_status_running)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.emerald_primary))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.emerald_primary)
            }
            VmStatus.STOPPING -> {
                stopButton.isEnabled = false
                statusText.text = getString(R.string.vm_status_stopping)
                statusText.setTextColor(ContextCompat.getColor(this, R.color.orange_accent))
                statusDot.backgroundTintList = ContextCompat.getColorStateList(this, R.color.orange_accent)
            }
        }
    }
}
