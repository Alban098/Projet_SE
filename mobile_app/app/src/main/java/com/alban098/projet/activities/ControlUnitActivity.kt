package com.alban098.projet.activities

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.*
import com.alban098.projet.R
import com.alban098.projet.databinding.ActivityControlUnitBinding
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationAPIClient
import com.auth0.android.authentication.storage.CredentialsManager
import com.auth0.android.authentication.storage.CredentialsManagerException
import com.auth0.android.authentication.storage.SharedPreferencesStorage
import com.auth0.android.callback.Callback
import com.auth0.android.result.Credentials
import com.alban098.projet.utils.ApiClient
import com.alban098.projet.views.ControlUnitView
import kotlin.concurrent.fixedRateTimer

class ControlUnitActivity : AppCompatActivity() {

    companion object {
        const val USERNAME = "username"
    }

    private val itemControlListMap: MutableMap<String, MutableMap<String, ControlUnitView>> = HashMap()
    private lateinit var binding: ActivityControlUnitBinding


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityControlUnitBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.reload.setOnClickListener { reloadItems() }
        binding.refresh.setOnClickListener { refreshItems() }
        binding.name.text = intent.getStringExtra(USERNAME)

        val auth0 = Auth0(getString(R.string.com_auth0_client_id), getString(R.string.com_auth0_domain))
        val authAPIClient = AuthenticationAPIClient(auth0)
        val sharedPreferenceStorage = SharedPreferencesStorage(this)
        val credentialManager = CredentialsManager(authAPIClient, sharedPreferenceStorage)

        credentialManager.getCredentials(object : Callback<Credentials, CredentialsManagerException> {
            override fun onSuccess(result: Credentials) {
                ApiClient.initService(getString(R.string.api_url), result.accessToken)
                reloadItems()
            }

            override fun onFailure(error: CredentialsManagerException) {
                Toast.makeText(this@ControlUnitActivity, "Error: " + error.message, Toast.LENGTH_SHORT).show()
                Log.e("Auth0", error.message.toString())
            }
        })

        fixedRateTimer("timer", false, 0L, 5000) {
            this@ControlUnitActivity.runOnUiThread {
                refreshItems()
            }
        }
    }

    private fun reloadItems() {
        ApiClient.fetch()
        createUI()
    }

    private fun refreshItems() {
        ApiClient.synchronizeAll()
        refreshUI()
    }

    private fun createUI() {
        val layout = findViewById<LinearLayout>(R.id.layout)
        layout.removeAllViews()
        for (item in ApiClient.getItems()) {
            val title = EditText(this)
            title.setText(item.name)
            title.setTextColor(Color.BLUE)
            title.isEnabled = false
            layout.addView(title)
            if (!itemControlListMap.containsKey(item.id))
                itemControlListMap[item.id] = HashMap()
            val controlMap = itemControlListMap[item.id]
            controlMap?.clear()
            for (control in item.controls.values) {
                if (controlMap != null) {
                    val view = control.createView(this, item)
                    controlMap[control.id] = view
                    layout.addView(view.getView())
                }
            }
        }
    }

    private fun refreshUI() {
        for (item in ApiClient.getItems()) {
            if (itemControlListMap.containsKey(item.id)) {
                val controlMap = itemControlListMap[item.id]
                if (controlMap != null) {
                    for (control in controlMap.values) {
                        control.updateControl()
                    }
                }
            }
        }
    }
}