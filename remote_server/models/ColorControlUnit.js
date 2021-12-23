const ControlUnit = require("./ControlUnit");

/**
 * Represent a Color Picker Control, holding ether an RGB Color from 0 to 256^3 - 1
 * Red   = (val & 0xFF0000) >> 16
 * Green = (val & 0x00FF00) >> 8
 * Blue  = (val & 0x0000FF)
 */
class ColorControlUnit extends ControlUnit {

    _min = 0x000000;
    _max = 0xFFFFFF;

    constructor(control) {
        super(control);
        this._value = 0;
    }

    get value() {
        return super.value;
    }

    set value(value) {
        this._value = Math.min(this._max, Math.max(this._min, value));
    }
}

module.exports = ColorControlUnit;