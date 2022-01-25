const Item = require("../../models/Item");
const axios = require('axios');
const { randomUUID } = require("crypto");


class RGBStrip extends Item {

    _api_URL = "/api";

    _pluginsControls = [
        {arg: "palette", name: "Palette", type: "combo", fill_arg: "palettes"},
        {arg: "effect", name: "Effect", type: "combo", fill_arg: "effects"},
        {arg: "primary_color", name: "Primary Color", type: "color"},
        {arg: "secondary_color", name: "Secondary Color", type: "color"},
        {arg: "tertiary_color", name: "Tertiary Color", type: "color"},
        {arg: "speed", name: "Effect Speed", type: "int"},
        {arg: "intensity", name: "Effect Intensity", type: "int"},
        {arg: "brightness", name: "Brightness", type: "int"}
    ]

    _enabled_controls;

    _control_ids_by_arg = [];
    _control_args_by_id = [];

    constructor(id, name, address, enabledControls) {
        super(id, name, address);
        this._enabled_controls = enabledControls;
        for (let index in this._pluginsControls) {
            let pluginsControl = this._pluginsControls[index];
            if (pluginsControl.type !== "combo") {
                let id = randomUUID();
                let controlUnit = {
                    id: id,
                    name: pluginsControl.name,
                    type: pluginsControl.type,
                    control: pluginsControl.arg,
                    present: false,
                    read_only: false
                };
                this._control_ids_by_arg[pluginsControl.arg] = id;
                this._control_args_by_id[id] = pluginsControl.arg;
                for (let i in enabledControls) {
                    if (enabledControls[i].name === pluginsControl.name)
                        controlUnit.present = true;
                }
                this.addControl(controlUnit);
            }
        }
        this.fillComboChoices();
    }

    async fetch() {
        if (!this.hasControl("combo"))
            await this.fillComboChoices();
        return axios.get("http://" + this.address + this._api_URL, {params: {status: 0}}).then(res => {
            for (let arg in res.data) {
                if (this.controls[this._control_ids_by_arg[arg]] !== undefined)
                    this.controls[this._control_ids_by_arg[arg]].value = res.data[arg];
            }
        }).catch(err => {
            console.error(err.code + " (" + this.address + ") failed to respond [fetch]");
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
            console.error(err.code + " (" + this.address + ") failed to respond [propagate]");
        });
    }

    async fillComboChoices() {
        for (let index in this._pluginsControls) {
            let pluginsControl = this._pluginsControls[index];
            if (pluginsControl.type === "combo") {
                let id = randomUUID();
                let controlUnit = {
                    id: id,
                    name: pluginsControl.name,
                    type: pluginsControl.type,
                    control: pluginsControl.arg,
                    present: false,
                    read_only: false
                };
                this._control_ids_by_arg[pluginsControl.arg] = id;
                this._control_args_by_id[id] = pluginsControl.arg;
                for (let i in this._enabled_controls) {
                    if (this._enabled_controls[i].name === pluginsControl.name)
                        controlUnit.present = true;
                }
                controlUnit.choices = [];
                let params = {}
                params[pluginsControl.fill_arg] = 0;
                await axios.get("http://" + this.address + this._api_URL, {params: params}).then(res => {
                    for (let choice in res.data)
                        controlUnit.choices[res.data[choice]] = choice;
                    this.addControl(controlUnit)
                }).catch(err => {
                    console.error(err.code + " (" + this.address + ") failed to respond");
                });
            }
        }
    }
}

module.exports = RGBStrip;
