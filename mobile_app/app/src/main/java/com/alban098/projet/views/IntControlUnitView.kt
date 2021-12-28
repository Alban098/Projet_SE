package com.alban098.projet.views

import android.content.Context
import android.view.View
import android.widget.TextView
import com.alban098.projet.models.IntControlUnit
import com.alban098.projet.models.Item
import com.alban098.projet.utils.ApiClient
import com.google.android.material.slider.Slider

class IntControlUnitView(context: Context, controlUnit: IntControlUnit, parent: Item) : ControlUnitView(context, controlUnit) {

    private val control: View

    init {
        if (controlUnit.editable) {
            control = Slider(context)
            control.valueFrom = controlUnit.min.toFloat()
            control.valueTo = controlUnit.max.toFloat()
            control.value = controlUnit.getVal().toFloat()
            control.stepSize = 1F
            control.addOnSliderTouchListener(object : Slider.OnSliderTouchListener {
                override fun onStartTrackingTouch(slider: Slider) {}

                override fun onStopTrackingTouch(slider: Slider) {
                    controlUnit.setVal(slider.value.toInt())
                    ApiClient.apply(parent)
                }
            })
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
        if (control is Slider && controlUnit is IntControlUnit)
            control.value = controlUnit.getVal().toFloat()
        else if (control is TextView && controlUnit is IntControlUnit)
            control.text = controlUnit.getVal().toString()
    }
}