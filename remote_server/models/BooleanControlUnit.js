const ControlUnit = require("./ControlUnit");

/**
 * Represent a Boolean Control, holding ether 0 or 1
 */
class BooleanControlUnit extends ControlUnit {

    constructor(control) {
        super(control);
        this._value = 0;
    }

    get value() {
        return super.value;
    }

    set value(value) {
        this._value = value !== 0 ? 1 : 0;
    }
}

module.exports = BooleanControlUnit;