package com.alban098.projet.views

import android.content.Context
import android.view.View
import android.widget.TextView
import androidx.appcompat.widget.SwitchCompat
import com.alban098.projet.models.BooleanControlUnit
import com.alban098.projet.models.IntControlUnit
import com.alban098.projet.models.Item
import com.alban098.projet.utils.ApiClient

class BooleanControlUnitView(context: Context, controlUnit: BooleanControlUnit, parent: Item) : ControlUnitView(context, controlUnit) {

    private val control: View

    init {
        if (controlUnit.editable) {
            control = SwitchCompat(context)
            control.isChecked = controlUnit.getVal() != 0
            control.text = ""
            control.setOnCheckedChangeListener { _, b ->
                controlUnit.setVal(if (b) 1 else 0)
                ApiClient.apply(parent)
            }
        } else {
            control = TextView(context)
            control.text = controlUnit.getVal().toString()
        }
        val text = TextView(context)
        text.text = controlUnit.name
        control.setPadding(10, 10, 10, 10)
        text.setPadding(10, 10, 10, 10)
        container.addView(text)
        container.addView(control)
    }

    override fun updateControl() {
        if (control is SwitchCompat && controlUnit is BooleanControlUnit)
            control.isChecked = controlUnit.getVal() != 0
        else if (control is TextView && controlUnit is IntControlUnit)
            control.text = controlUnit.getVal().toString()
    }
}