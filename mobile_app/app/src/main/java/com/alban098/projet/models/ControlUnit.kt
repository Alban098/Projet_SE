package com.alban098.projet.models

import android.content.Context
import com.alban098.projet.views.ControlUnitView
import java.io.Serializable


abstract class ControlUnit(val id: String, val name: String, val editable: Boolean) : Serializable {

    abstract fun getVal(): Any
    abstract fun setVal(value: Any)
    abstract fun createView(context: Context, parent: Item): ControlUnitView
}