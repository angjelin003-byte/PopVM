package com.example.popvm

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var vm: VmController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        vm = VmController(this)

        findViewById<Button>(R.id.startButton).setOnClickListener {
            vm.start()
        }

        findViewById<Button>(R.id.stopButton).setOnClickListener {
            vm.stop()
        }
    }
}
