package com.alban098.projet.models

import com.alban098.projet.utils.JSONUtils
import org.json.JSONObject
import java.io.Serializable

class Item(val id: String, var name: String, val controls: HashMap<String, ControlUnit>) :
    Serializable {

    fun setStates(controls: Collection<ControlUnit>) {
        for (control in controls) {
            if (this.controls.containsKey(control.id)) {
                this.controls[control.id]?.setVal(control.getVal())
            }
        }
    }

    fun setStates(json: JSONObject) {
        setStates(JSONUtils.parseItem(json).controls.values)
    }
}