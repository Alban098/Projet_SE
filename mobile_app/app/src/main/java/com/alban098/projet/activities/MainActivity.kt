package com.alban098.projet.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationAPIClient
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.callback.Callback
import com.auth0.android.provider.WebAuthProvider
import com.auth0.android.result.Credentials
import com.auth0.android.result.UserProfile
import com.google.android.material.snackbar.Snackbar
import android.content.Intent
import android.util.Log
import android.widget.Toast
import androidx.core.view.isVisible
import com.alban098.projet.R
import com.alban098.projet.databinding.ActivityMainBinding
import com.auth0.android.authentication.storage.CredentialsManager
import com.auth0.android.authentication.storage.CredentialsManagerException
import com.auth0.android.authentication.storage.SharedPreferencesStorage

class MainActivity : AppCompatActivity() {

    private lateinit var auth0: Auth0
    private lateinit var credentialsManager: CredentialsManager
    private lateinit var apiClient: AuthenticationAPIClient
    private lateinit var binding: ActivityMainBinding
    private var cachedCredentials: Credentials? = null
    private var cachedUserProfile: UserProfile? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set up the account object with the Auth0 application details
        auth0 = Auth0(getString(R.string.com_auth0_client_id), getString(R.string.com_auth0_domain))
        apiClient = AuthenticationAPIClient(auth0)
        credentialsManager = CredentialsManager(apiClient, SharedPreferencesStorage(this))

        // Bind the button click with the login action
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.buttonLogin.setOnClickListener { login() }
        binding.buttonLogout.setOnClickListener { logout() }
        binding.buttonLaunch.setOnClickListener { launch() }
    }

    private fun updateUI() {
        binding.buttonLogout.isEnabled = cachedCredentials != null
        binding.metadataPanel.isVisible = cachedCredentials != null
        binding.buttonLogin.isEnabled = cachedCredentials == null
        binding.userProfile.isVisible = cachedCredentials != null
        binding.buttonLaunch.isEnabled = cachedCredentials != null
        binding.buttonLaunch.isVisible = cachedCredentials != null

        binding.userProfile.text = "Name: ${cachedUserProfile?.name ?: ""}\nEmail: ${cachedUserProfile?.email ?: ""}"
    }

    private fun login() {
        // Setup the WebAuthProvider, using the custom scheme and scope.
        WebAuthProvider.login(auth0)
            .withScheme(getString(R.string.com_auth0_scheme))
            .withScope("admin:control openid profile email offline_access")
            .withAudience("https://projet-se/auth/api")

            // Launch the authentication passing the callback where the results will be received
            .start(this, object : Callback<Credentials, AuthenticationException> {
                override fun onFailure(error: AuthenticationException) {
                    showSnackBar("Failure: ${error.getCode()}")
                }

                override fun onSuccess(result: Credentials) {
                    cachedCredentials = result
                    credentialsManager.saveCredentials(result)
                    result.accessToken
                    showSnackBar("Success: access token acquired")
                    updateUI()
                    showUserProfile()
                }
            })
    }

    private fun logout() {
        WebAuthProvider.logout(auth0)
            .withScheme(getString(R.string.com_auth0_scheme))
            .start(this, object : Callback<Void?, AuthenticationException> {
                override fun onSuccess(result: Void?) {
                    // The user has been logged out!
                    cachedCredentials = null
                    cachedUserProfile = null
                    credentialsManager.clearCredentials()
                    updateUI()
                }

                override fun onFailure(error: AuthenticationException) {
                    updateUI()
                    showSnackBar("Failure: ${error.getCode()}")
                }
            })
    }

    private fun launch() {
        credentialsManager.getCredentials(object : Callback<Credentials, CredentialsManagerException> {
            override fun onSuccess(result: Credentials) {
                val intent = Intent(this@MainActivity, ControlUnitActivity::class.java);
                intent.putExtra(ControlUnitActivity.USERNAME, cachedUserProfile?.name)
                startActivity(intent)
            }

            override fun onFailure(error: CredentialsManagerException) {
                Toast.makeText(this@MainActivity, "Error: " + error.message, Toast.LENGTH_SHORT).show()
                Log.e("Auth0", error.message.toString())
            }
        })

    }

    private fun showUserProfile() {
        // Use the access token to call userInfo endpoint.
        // In this sample, we can assume cachedCredentials has been initialized by this point.
        apiClient.userInfo(cachedCredentials!!.accessToken).start(object : Callback<UserProfile, AuthenticationException> {
            override fun onFailure(error: AuthenticationException) {
                showSnackBar("Failure: ${error.getCode()}")
            }

            override fun onSuccess(result: UserProfile) {
                cachedUserProfile = result;
                updateUI()
            }
        })
    }

    private fun showSnackBar(text: String) {
        Snackbar.make(
            binding.root,
            text,
            Snackbar.LENGTH_LONG
        ).show()
    }
}