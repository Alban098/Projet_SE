package com.alban098

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent

import android.content.pm.PackageManager
import android.view.WindowManager
import android.os.Build
import android.os.Handler
import android.widget.TextView


class SplashActivity : AppCompatActivity() {
    private var versionTv: TextView? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        versionTv = findViewById(R.id.version)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            window.setFlags(
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            )
        }
        try {

        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        Handler().postDelayed({
            startActivity(Intent(this@SplashActivity, MainActivity::class.java))
            finish()
        }, 3500)
    }
}