const ControlUnit = require("./ControlUnit");

/**
 * Represent a Integer Control, holding a value between min and max
 */
class IntControlUnit extends ControlUnit {

    _min;
    _max;

    constructor(control) {
        super(control);
        this._min = control.min !== undefined ? control.min : -Infinity;
        this._max = control.max !== undefined ? control.max : +Infinity;
        this._value = 0x000000;
    }

    get min() {
        return this._min;
    }

    get max() {
        return this._max;
    }

    get value() {
        return super.value;
    }

    set value(value) {
        this._value = Math.min(this._max, Math.max(this._min, value));
    }
}

module.exports = IntControlUnit;