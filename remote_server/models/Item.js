const ColorControlUnit = require("./ColorControlUnit");
const IntControlUnit = require("./IntControlUnit");
const FloatControlUnit = require("./FloatSliderControlUnit");
const ComboControlUnit = require("./ComboControlUnit");
const BooleanControlUnit = require("./BooleanControlUnit");
const http = require("http");

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
     * @type {[ControlUnit]}
     * @private
     */
    _controls = [];

    /**
     * Just a map used to store the concordance between control IDs and mapped controls
     * @type {[String]}
     * @private
     */
    _ids = [];

    /**
     * The IP address where the Item can be called from
     * @private
     */
    _address;

    constructor(id, name, address, controls) {
        this._id = id;
        this._name = name;
        this._address = address;
        controls.forEach(control => {
            this._ids[control.id] = control.control;
            switch (control.type) {
                case "boolean":
                    this._controls[control.control] = new BooleanControlUnit(control);
                    break;
                case "color":
                    this._controls[control.control] = new ColorControlUnit(control);
                    break;
                case "int":
                    this._controls[control.control] = new IntControlUnit(control);
                    break;
                case "float":
                    this._controls[control.control] = new FloatControlUnit(control);
                    break;
                case "combo":
                    this._controls[control.control] = new ComboControlUnit(control);
                    //If the control is a Combo, fetch the possible values from the fill path specified in the config file
                    if (control.api_fill_path !== undefined)
                        this.fillCombo(this._controls[control.control], control.api_fill_path);
                    break;
            }
        });
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

    getControl(id) {
        return this._controls[this._ids[id]];
    }

    fetch() {}

    propagate() {}

    fillCombo(controlUnit, args) {
        let options = {
            host: this._address,
            path: '/api',
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(args)
            }
        };

        let request = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //Fetch choices and then save them to the ControlUnit
                let effects = JSON.parse(chunk)
                for (let effect in effects)
                    controlUnit.addChoice(effects[effect], effect)
            });
        });
        request.write(args);
        request.end();
    }

    /**
     * Convert the current Item to a Status JSON String
     * @returns {Promise<{controls: *[], name, id}>}
     */
    async toJSON() {
        //Fetch the current state
        await this.fetch();
        //Then generate JSON String
        let json = {id: this._id, name: this._name, controls: []};
        for (let control in this._controls) {
            json.controls.push({id: this.controls[control].id, value: this.controls[control].value});
        }
        return json;
    }
}

module.exports = Item;