/**
 * Represent an abstract Control with it's ID, name, type, linked control and whether it is editable or not
 */
class ControlUnit {

    _id;
    _name;
    _type;
    _value;
    _editable;
    _present;

    constructor(control) {
        this._id = control.id;
        this._name = control.name;
        this._type = control.type;
        this._present = control.present;
        this._editable = control.read_only === undefined || control.read_only !== true;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get type() {
        return this._type;
    }

    get editable() {
        return this._editable;
    }


    get present() {
        return this._present;
    }
}

module.exports = ControlUnit;