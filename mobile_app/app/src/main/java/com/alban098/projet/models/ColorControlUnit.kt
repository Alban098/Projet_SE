package com.alban098.projet.models

import android.content.Context
import com.alban098.projet.views.ColorControlUnitView
import com.alban098.projet.views.ControlUnitView


class ColorControlUnit(id: String, name: String, editable: Boolean, private var value: Int) : ControlUnit(id, name, editable) {

    override fun getVal(): Int {
        return this.value
    }

    override fun setVal(value: Any) {
        this.value = value as Int
    }

    override fun createView(context: Context, parent: Item): ControlUnitView {
        return ColorControlUnitView(context, this, parent)
    }
}