package com.alban098.projet.views

import android.content.Context
import android.view.View
import android.widget.Button
import android.widget.TextView
import com.alban098.projet.models.ColorControlUnit
import com.alban098.projet.models.IntControlUnit
import com.alban098.projet.models.Item
import com.alban098.projet.utils.ApiClient
import com.flask.colorpicker.ColorPickerView
import com.flask.colorpicker.builder.ColorPickerDialogBuilder
import com.google.android.material.slider.Slider

class ColorControlUnitView(context: Context, controlUnit: ColorControlUnit, parent: Item) : ControlUnitView(context, controlUnit) {

    private val control: View

    init {
        if (controlUnit.editable) {
            control = Button(context)
            control.setBackgroundColor((controlUnit.getVal().toLong() or 0xFF000000).toInt())
            control.setOnClickListener {
                ColorPickerDialogBuilder
                    .with(context)
                    .setTitle("Color")
                    .initialColor((controlUnit.getVal().toLong() or 0xFF000000).toInt())
                    .wheelType(ColorPickerView.WHEEL_TYPE.FLOWER)
                    .density(12)
                    .setPositiveButton("Apply") { _, selectedColor, _ ->
                        controlUnit.setVal((selectedColor) and 0xFFFFFF)
                        control.setBackgroundColor((controlUnit.getVal().toLong() or 0xFF000000).toInt())
                        ApiClient.apply(parent)
                    }
                    .setNegativeButton("Cancel") { _, _ -> }
                    .build()
                    .show()
            }
        } else {
            control = TextView(context)
            control.setBackgroundColor((controlUnit.getVal().toLong() or 0xFF000000).toInt())
        }

        val text = TextView(context)
        text.text = controlUnit.name
        control.setPadding(10, 10, 10, 10)
        text.setPadding(10, 10, 10, 10)
        container.addView(text)
        container.addView(control)
    }

    override fun updateControl() {
        if (control is Slider && controlUnit is ColorControlUnit)
            control.value = (controlUnit.getVal().toLong() or 0xFF000000).toFloat()
        else if (control is TextView && controlUnit is IntControlUnit)
            control.setBackgroundColor((controlUnit.getVal().toLong() or 0xFF000000).toInt())
    }
}