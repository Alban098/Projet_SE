const ColorControlUnit = require("./ColorControlUnit");
const IntControlUnit = require("./IntControlUnit");
const FloatControlUnit = require("./FloatSliderControlUnit");
const ComboControlUnit = require("./ComboControlUnit");
const BooleanControlUnit = require("./BooleanControlUnit");

/**
 * Represent an Item connected to the API
 */
class Item {

    /**
     * Item UUID, generated at startup, not consistent after shutdown
     * @private
     */
    _id;

    /**
     * Item's name that can be displayed by client applications
     * @private
     */
    _name;

    /**
     * List of controls that can act on that item
     * @type {[ControlUnit]} indexed by control IDs
     * @private
     */
    _controls = [];

    /**
     * The IP address where the Item can be called from
     * @private
     */
    _address;

    constructor(id, name, address) {
        this._id = id;
        this._name = name;
        this._address = address;
    }

    addControl(control) {
        switch (control.type) {
            case "boolean":
                this._controls[control.id] = new BooleanControlUnit(control);
                break;
            case "color":
                this._controls[control.id] = new ColorControlUnit(control);
                break;
            case "int":
                this._controls[control.id] = new IntControlUnit(control);
                break;
            case "float":
                this._controls[control.id] = new FloatControlUnit(control);
                break;
            case "combo":
                let combo = new ComboControlUnit(control);
                for (let id in control.choices) {
                    combo.addChoice(id, control.choices[id]);
                }
                this._controls[control.id] = combo;
                break;
        }
    }

    get id() {
        return this._id;
    }

    get address() {
        return this._address;
    }

    get controls() {
        return this._controls;
    }

    /**
     * Set the value of a ControlUnit
     * @param id the ControlUnit id
     * @param value the new value
     */
    setControlValue(id, value) {
        if (this._controls[id] !== undefined && this._controls[id]._editable && this._controls[id]._present)
            this._controls[id].value = value;
    }

    /**
     * Update the Item's ControlUnits from a request
     * [
     *     {id: "ccefe8bf-ec9b-46c5-bc85-cf0ecd8b9cf0", value: 255}
     *     ...
     * ]
     * @param controls JSON Array containing ControlUnit ids and new values
     */
    updateControls(controls) {
        //for each control change it's value if it is present and editable
        for (let index in controls) {
            let id = controls[index].id;
            let value = controls[index].value;
            this.setControlValue(id, value)
        }
    }

    fetch() {}

    propagate() {}

    /**
     * Convert the current Item to a Status JSON String
     * @returns {Promise<{controls: *[], name, id}>}
     */
    async toJSON(fetch) {
        let json = {};
        if (fetch) {
            await this.fetch();
            json = this.generateJSON();
        } else {
            await new Promise((resolve) => {
                json = this.generateJSON();
                resolve(0);
            });
        }
        return json;
    }

    /**
     * Return a JSON representation of the Item
     * @returns {{controls: *[], name, id}}
     */
    generateJSON() {
        let json = {id: this._id, name: this._name, controls: []};
        for (let control in this._controls) {
            if (this.controls[control].present) {
                switch (this.controls[control].type) {
                    case "boolean":
                    case "combo":
                    case "color":
                        json.controls.push({id: this.controls[control].id, type: this.controls[control].type, value: this.controls[control].value, editable: this.controls[control].editable});
                        break;
                    case "float":
                    case "int":
                        json.controls.push({id: this.controls[control].id, type: this.controls[control].type, value: this.controls[control].value, editable: this.controls[control].editable, min: this.controls[control].min, max: this.controls[control].max});
                        break;
                }
            }
        }
        return json;
    }

    /**
     * Generate the MetaData of the Item, used to construct Client interface
     * contains Item's id, Item's name, and each ControlUnit with there ids, name, type and other useful attributes
     * @returns {{controls: *[], name, id}}
     */
    async generateJSONMetaData(fetch) {
        if (fetch)
            await this.fetch();

        let jsonControls = [];
        await new Promise((resolve) => {
            //Create an array of available controls

            //For each control (viewable or not)
            for (let id in this._controls) {
                let control = this._controls[id];

                //It the control is viewable
                if (control._present) {

                    //Append it to the array
                    var json = {}
                    switch (control._type) {
                        case "boolean":
                        case "combo":
                        case "color":
                            json = {
                                id: control._id,
                                name: control._name,
                                type: control._type,
                                editable: control._editable,
                                value: control._value
                            };
                            break;
                        case "float":
                        case "int":
                            json = {
                                id: control._id,
                                name: control._name,
                                type: control._type,
                                editable: control._editable,
                                value: control._value,
                                min: control.min,
                                max: control.max
                            }
                            break;
                    }


                    //If it's a ComboBox, add the possible choices with theres indices
                    if (control instanceof ComboControlUnit && control.choices !== undefined) {
                        let choices = []
                        for (let id in control.choices) {
                            choices.push({id: id, value: control.choices[id]})
                        }
                        json.choices = choices
                    }
                    jsonControls.push(json);
                }
            }
            resolve(0)
        });

        //Return a JSON representing the item's MetaData
        return {id: this._id,  name: this._name, controls: jsonControls}
    }
}

module.exports = Item;