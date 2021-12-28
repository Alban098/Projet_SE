package com.alban098.projet.utils

import com.alban098.projet.models.Item

object ApiClient {

    private val items: HashMap<String, Item> = HashMap()

    fun getItems(): MutableCollection<Item> {
        return items.values
    }

    fun getItem(id: String): Item? {
        return items[id]
    }

    fun fetch() {
        items.clear()
        val newItems = apiService.fetch();
        for (item in newItems)
            items[item.id] = item
    }

    fun apply(item: Item) {
        apiService.apply(item)
    }

    fun synchronize(item: Item) {
        apiService.synchronize(item)
    }

    fun synchronizeAll() {
        val synchronizedItems = apiService.synchronizeAll()
        for (item in synchronizedItems) {
            if (this.items.containsKey(item.id)) {
                this.items[item.id]?.setStates(item.controls.values)
            }
        }
    }

    fun initService(endPoint: String, token: String) {
        apiService.init(endPoint, token)
    }

    private val apiService : ApiService by lazy {
        ApiService()
    }
}