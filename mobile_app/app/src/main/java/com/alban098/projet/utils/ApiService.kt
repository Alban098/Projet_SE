package com.alban098.projet.utils

import android.util.Log
import com.alban098.projet.models.Item
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.CountDownLatch

class ApiService() {

    private lateinit var apiURL: String
    private lateinit var accessToken: String

    fun init(apiURL: String, token: String) {
        this.apiURL = apiURL
        this.accessToken = token
    }

    fun reload(): String {
        val request = constructRequest("/reload").get().build()
        var returnVal = ""

        val client = OkHttpClient()
        val countDownLatch = CountDownLatch(1)
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("API", e.message.toString())
                returnVal = "Error"
                countDownLatch.countDown()
            }

            override fun onResponse(call: Call, response: Response) {
                val json = JSONObject(response.body?.string().toString())
                returnVal = json.getString("status")
                countDownLatch.countDown()
            }
        })
        countDownLatch.await()
        return returnVal
    }

    fun synchronizeAll(): List<Item> {
        val request = constructRequest("/synchronize/all").get().build()
        val items = ArrayList<Item>()

        val countDownLatch = CountDownLatch(1)
        val client = OkHttpClient()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("API", e.message.toString())
                countDownLatch.countDown()
            }

            override fun onResponse(call: Call, response: Response) {
                val json = JSONObject(response.body?.string().toString())
                val array = json.getJSONArray("items")
                for (i in 0 until array.length()) {
                    val jsonItem = array.getJSONObject(i);
                    val item = JSONUtils.parseItem(jsonItem);
                    items.add(item)
                }
                countDownLatch.countDown()
            }
        })
        countDownLatch.await()
        return items
    }

    fun synchronize(item: Item) {
        val request = constructRequest("/reload").post(
            JSONUtils.toJSONId(item).toRequestBody("application/json".toMediaTypeOrNull())
        ).build()

        val countDownLatch = CountDownLatch(1)
        val client = OkHttpClient()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("API", e.message.toString())
                countDownLatch.countDown()
            }

            override fun onResponse(call: Call, response: Response) {
                val json = JSONObject(response.body?.string().toString())
                item.setStates(json)
                countDownLatch.countDown()
            }
        })
        countDownLatch.await()
    }

    fun fetch(): List<Item> {
        val request = constructRequest("/fetch").get().build()
        val items = ArrayList<Item>()

        val client = OkHttpClient()
        val countDownLatch = CountDownLatch(1)
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("API", e.message.toString())
                countDownLatch.countDown()
            }

            override fun onResponse(call: Call, response: Response) {
                val json = JSONObject(response.body?.string().toString())
                val array = json.getJSONArray("items")
                for (i in 0 until array.length()) {
                    val jsonItem = array.getJSONObject(i);
                    val item = JSONUtils.parseItem(jsonItem);
                    items.add(item)
                }
                countDownLatch.countDown()
            }
        })
        countDownLatch.await()
        return items
    }

    fun apply(item : Item) {
        val request = constructRequest("/apply").post(
            JSONUtils.toJSON(item).toRequestBody("application/json".toMediaTypeOrNull())
        ).build()

        val countDownLatch = CountDownLatch(1)
        OkHttpClient().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("API", e.message.toString())
                countDownLatch.countDown()
            }

            override fun onResponse(call: Call, response: Response) {
                val json = JSONObject(response.body?.string().toString())
                item.setStates(json)
                countDownLatch.countDown()
            }
        })
        countDownLatch.await()
    }

    private fun constructRequest(endPoint: String) : Request.Builder {
        return Request.Builder()
            .url(apiURL + endPoint)
            .header("Authorization", "Bearer $accessToken")
    }
}