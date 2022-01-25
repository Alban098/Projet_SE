const Item = require("../../models/Item");
const ItemService = require('../../services/ItemService');
const http = require('http');
const {randomUUID} = require("crypto");
const axios = require("axios");


class THSensor extends Item {

    _api_URL = "/api";

    _pluginsControls = [
        {arg: "temperature", name: "Temperature", type: "float", read_only: true},
        {arg: "humidity", name: "Humidity", type: "float", read_only: true}
    ]

    _control_ids_by_arg = [];
    _control_args_by_id = [];

    constructor(id, name, address, enabledControls) {
        super(id, name, address);
        for (let index in this._pluginsControls) {
            let pluginsControl = this._pluginsControls[index];
            let id = randomUUID();
            let controlUnit = {id: id, name: pluginsControl.name, type: pluginsControl.type, control: pluginsControl.arg, present: false, read_only: pluginsControl.read_only};
            this._control_ids_by_arg[pluginsControl.arg] = id;
            this._control_args_by_id[id] = pluginsControl.arg;
            for (let i in enabledControls) {
                if (enabledControls[i].name === pluginsControl.name)
                    controlUnit.present = true;
            }
            this.addControl(controlUnit);
        }
    }

    fetch() {
        return axios.get("http://" + this.address + this._api_URL, { params: {status: 0} }).then(res => {
            for (let arg in res.data) {
                if (this.controls[this._control_ids_by_arg[arg]] !== undefined)
                    this.controls[this._control_ids_by_arg[arg]].value = res.data[arg];
            }
        }).catch(err => {
            console.error(err.code + " (" + this.address + ") failed to respond [" + err.name + "]");
        });
    }

    propagate() {
        let data = {};
        for (let id in this.controls)
            data[this._control_args_by_id[id]] = this.controls[id].value;
        return axios.post("http://" + this.address + this._api_URL, null, { params: data}).then(res => {
            for (let arg in res.data) {
                if (this.controls[this._control_ids_by_arg[arg]] !== undefined)
                    this.controls[this._control_ids_by_arg[arg]].value = res.data[arg];
            }
        }).catch(err => {
            console.error(err.code + " (" + this.address + ") failed to respond [" + err.name + "]");
        });
    }

}

module.exports = THSensor;
