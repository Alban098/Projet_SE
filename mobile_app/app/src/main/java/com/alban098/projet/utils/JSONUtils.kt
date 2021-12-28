package com.alban098.projet.utils

import com.alban098.projet.models.*
import org.json.JSONArray
import org.json.JSONObject

class JSONUtils {

    companion object {
        fun toJSON(item: Item) : String {
            val json = JSONObject()
            json.put("id", item.id)
            val array = JSONArray()
            for (control in item.controls.values) {
                val controlJSON = JSONObject();
                controlJSON.put("id", control.id)
                controlJSON.put("value", control.getVal())
                array.put(controlJSON)
            }
            json.put("controls", array)
            return json.toString(4)
        }

        fun toJSONId(item: Item) : String {
            val json = JSONObject()
            json.put("id", item.id)
            return json.toString(4)
        }

        fun parseItem(json: JSONObject) : Item {
            val id = json.getString("id")
            val name = json.getString("name")
            val controls = json.getJSONArray("controls")
            val controlUnits = HashMap<String, ControlUnit>()
            for (i in 0 until controls.length()) {
                val controlJson = controls.getJSONObject(i)
                val c_type = if (controlJson.has("type")) controlJson.getString("type") else "undefined"
                val c_id = if (controlJson.has("id")) controlJson.getString("id") else "undefined"
                val c_name = if (controlJson.has("name")) controlJson.getString("name") else "undefined"
                val c_editable = if (controlJson.has("editable")) controlJson.getBoolean("editable") else true

                var controlUnit : ControlUnit?
                when (c_type) {
                    "boolean" -> {
                        val c_value = if (controlJson.has("value")) controlJson.getInt("value") else 0
                        controlUnit = BooleanControlUnit(c_id, c_name, c_editable, c_value)
                    }
                    "int" -> {
                        val c_value = if (controlJson.has("value")) controlJson.getInt("value") else 0
                        val c_min = if (controlJson.has("min")) controlJson.getInt("min") else 0
                        val c_max = if (controlJson.has("max")) controlJson.getInt("max") else 255
                        controlUnit = IntControlUnit(c_id, c_name, c_editable, c_value, c_min, c_max)
                    }
                    "color" -> {
                        val c_value = if (controlJson.has("value")) controlJson.getInt("value") else 0
                        controlUnit = ColorControlUnit(c_id, c_name, c_editable, c_value)
                    }
                    "float" -> {
                        val c_value = if (controlJson.has("value")) controlJson.getDouble("value").toFloat() else 0f
                        val c_min = if (controlJson.has("min")) controlJson.getDouble("min").toFloat() else 0f
                        val c_max = if (controlJson.has("max")) controlJson.getDouble("max").toFloat() else 100f
                        controlUnit = FloatControlUnit(c_id, c_name, c_editable, c_value, c_min, c_max)
                    }
                    "combo" -> {
                        val c_value = if (controlJson.has("value")) controlJson.getInt("value") else 0
                        controlUnit = ComboControlUnit(c_id, c_name, c_editable, c_value)
                        if (controlJson.has("choices")) {
                            val choices = controlJson.getJSONArray("choices")
                            for (j in 0 until choices.length()) {
                                val choice = choices.getJSONObject(j)
                                controlUnit.addChoice(
                                    choice.getString("id").toInt(),
                                    choice.getString("value")
                                )
                            }
                        }
                    }
                    else -> controlUnit = null;
                }
                if (controlUnit != null)
                    controlUnits[c_id] = controlUnit
            }
            return Item(id, name, controlUnits)
        }
    }
}