package com.alban098.projet.views

import android.R
import android.content.Context
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.TextView
import com.alban098.projet.models.ComboControlUnit
import com.alban098.projet.models.Item
import com.alban098.projet.utils.ApiClient

class ComboControlUnitView(context: Context, controlUnit: ComboControlUnit, parent: Item) : ControlUnitView(context, controlUnit) {

    private val control: View

    init {
        if (controlUnit.editable) {
            control = Spinner(context)
            val adapter = ArrayAdapter(context, R.layout.simple_spinner_item, controlUnit.choices)
            control.adapter = adapter
            control.setSelection(controlUnit.getVal())
            control.onItemSelectedListener = object :
                AdapterView.OnItemSelectedListener {
                override fun onItemSelected(adapter: AdapterView<*>, view: View, position: Int, id: Long) {
                    controlUnit.indexToId[position]?.let { controlUnit.setVal(it) }
                    ApiClient.apply(parent)
                }

                override fun onNothingSelected(parent: AdapterView<*>) {}
            }
        } else {
            control = TextView(context)
            control.text = controlUnit.choices[controlUnit.indexToId[controlUnit.getVal()]!!]
        }

        val text = TextView(context)
        text.text = controlUnit.name
        control.setPadding(10, 10, 10, 10)
        text.setPadding(10, 10, 10, 10)
        container.addView(text)
        container.addView(control)
    }

    override fun updateControl() {
        if (control is Spinner && controlUnit is ComboControlUnit)
            control.setSelection(controlUnit.getVal())
        else if (control is TextView && controlUnit is ComboControlUnit)
            control.text = controlUnit.choices[controlUnit.indexToId[controlUnit.getVal()]!!]
    }
}