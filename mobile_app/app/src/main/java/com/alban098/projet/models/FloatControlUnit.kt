package com.alban098.projet.models

import android.content.Context
import com.alban098.projet.views.ControlUnitView
import com.alban098.projet.views.FloatControlUnitView

class FloatControlUnit(id: String, name: String, editable: Boolean, private var value: Float, var min: Float, var max: Float) : ControlUnit(id, name, editable) {

    override fun getVal(): Float {
        return this.value
    }

    override fun setVal(value: Any) {
        this.value = value as Float
    }

    override fun createView(context: Context, parent: Item): ControlUnitView {
        return FloatControlUnitView(context, this, parent)
    }
}