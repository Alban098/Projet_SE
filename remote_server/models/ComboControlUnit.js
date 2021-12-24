const ControlUnit = require("./ControlUnit");

/**
 * Represent a ComboBox Control, holding ether the selected index along with their titles
 */
class ComboControlUnit extends ControlUnit {

    /**
     * List of choices of the ComboBox
     * @type {[]}
     */
    choices = [];

    constructor(control) {
        super(control);
        this._value = 0;
    }

    addChoice(id, choice) {
        this.choices[id] = choice;
    }
}

module.exports = ComboControlUnit;