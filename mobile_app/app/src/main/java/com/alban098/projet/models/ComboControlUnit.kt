package com.alban098.projet.models

import android.content.Context
import com.alban098.projet.views.ComboControlUnitView
import com.alban098.projet.views.ControlUnitView

class ComboControlUnit(id: String, name: String, editable: Boolean, private var value: Int) : ControlUnit(id, name, editable) {

    val choices: MutableList<String> = ArrayList();
    val indexToId: MutableMap<Int, Int> = HashMap()

    override fun getVal(): Int {
        return this.value
    }

    override fun setVal(value: Any) {
        this.value = value as Int
    }

    override fun createView(context: Context, parent: Item): ControlUnitView {
        return ComboControlUnitView(context, this, parent)
    }

    fun addChoice(id: Int, choice: String) {
        choices.add(choice)
        indexToId[choices.size - 1] = id;
    }
}