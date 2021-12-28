package com.alban098.projet.views

import android.content.Context
import android.view.Gravity
import android.widget.LinearLayout
import com.alban098.projet.models.ControlUnit

abstract class ControlUnitView(context: Context, protected val controlUnit: ControlUnit) {

    protected val container: LinearLayout = LinearLayout(context)

    init {
        container.gravity = Gravity.CENTER
    }

    fun getView() : LinearLayout {
        return container
    }

    abstract fun updateControl()
}