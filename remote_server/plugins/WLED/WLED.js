const Item = require("../../models/Item");
const ItemService = require('../../services/ItemService');
const http = require('http');
const axios = require('axios');
const {randomUUID} = require("crypto");


class WLED extends Item {

    _api_URL = "";

    _pluginsControls = [
        {arg: "on", name: "On", type: "boolean"},
        {arg: "pal", path: "seg", path_type: "array", name: "Palette", type: "combo", fill_path: "/json/pal"},
        {arg: "fx", path: "seg", path_type: "array", name: "Effect", type: "combo", fill_path: "/json/eff"},
        {arg: "col_0", index: 0, path: "seg", path_type: "array", name: "Primary Color", type: "color"},
        {arg: "col_1", index: 1, path: "seg", path_type: "array", name: "Secondary Color", type: "color"},
        {arg: "col_2", index: 2, path: "seg", path_type: "array", name: "Tertiary Color", type: "color"},
        {arg: "sx", path: "seg", path_type: "array", name: "Effect Speed", type: "int"},
        {arg: "ix", path: "seg", path_type: "array", type: "array", name: "Effect Intensity", type: "int"},
        {arg: "bri", name: "Brightness", type: "int"}
    ]

    _control_ids_by_arg = [];
    _control_args_by_id = [];

    constructor(id, name, address, enabledControls) {
        super(id, name, address);
        for (let index in this._pluginsControls) {
            let pluginsControl = this._pluginsControls[index];
            let id = randomUUID();
            let controlUnit = {id: id, name: pluginsControl.name, type: pluginsControl.type, control: pluginsControl.arg, present: false, read_only: false};
            this._control_ids_by_arg[pluginsControl.arg] = id;
            this._control_args_by_id[id] = pluginsControl.arg;
            for (let i in enabledControls) {
                if (enabledControls[i].name === pluginsControl.name)
                    controlUnit.present = true;
            }
            if (pluginsControl.type === "combo") {
                controlUnit.choices = [];
                axios.get("http://" + this.address + pluginsControl.fill_path).then(res => {
                    for (let choice in res.data)
                        controlUnit.choices[choice] = res.data[choice];
                    this.addControl(controlUnit)
                }).catch(err => {
                    console.log(err.code);
                    ItemService.removeItem(this._id)
                });
            } else {
                this.addControl(controlUnit);
            }
        }
    }

    fetch() {
        return axios.get("http://" + this.address + "/json/state").then(res => {
            let status = res.data
            for (let index in this._pluginsControls) {
                let controlParam = this._pluginsControls[index];
                let controlState = status[controlParam.arg];
                if (controlParam.path != undefined)
                    controlState = status[controlParam.path][0][controlParam.arg.split("_")[0]];
                if (controlParam.index != undefined)
                    controlState = controlState[controlParam.index];
                let controlUnit = this.controls[this._control_ids_by_arg[controlParam.arg]];
                if (controlUnit !== undefined && controlUnit.present) {
                    let value = controlState;
                    if (controlParam.type === 'color')
                        value = (controlState[0] << 16) | (controlState[1] << 8) | controlState[2];
                    if (controlParam.type === 'boolean')
                        value = controlState ? 1 : 0;
                    controlUnit.value = value;
                }
            }
        }).catch(err => {
            console.log(err.code);
            ItemService.removeItem(this._id)
        });
    }

    async propagate() {
        let data = {}

        for (let index in this._pluginsControls) {
            let controlParam = this._pluginsControls[index];
            let controlUnit = this.controls[this._control_ids_by_arg[controlParam.arg]];
            let value = controlUnit.value;
            if (controlUnit.type === 'color')
                value = [(controlUnit.value >> 16) & 0xFF, (controlUnit.value >> 8) & 0xFF, (controlUnit.value) & 0xFF];
            if (controlUnit.type === 'boolean')
                value = controlUnit.value === 0 ? false : true;
            if (controlParam.path != undefined) {
                if (controlParam.path_type === "array") {
                    if (data[controlParam.path] === undefined)
                        data[controlParam.path] = [{}];
                    if (controlParam.index !== undefined) {
                        if (data[controlParam.path][0][controlParam.arg.split("_")[0]] === undefined)
                            data[controlParam.path][0][controlParam.arg.split("_")[0]] = [];
                        data[controlParam.path][0][controlParam.arg.split("_")[0]][parseInt(controlParam.index)] = value;
                    } else {
                        data[controlParam.path][0][controlParam.arg.split("_")[0]] = value;
                    }
                } else {
                    if (data[controlParam.path] === undefined)
                        data[controlParam.path] = {};
                    if (controlParam.index !== undefined) {
                        if (data[controlParam.path][controlParam.arg.split("_")[0]] === undefined)
                            data[controlParam.path][controlParam.arg.split("_")[0]] = [];
                        data[controlParam.path][controlParam.arg.split("_")[0]][parseInt(controlParam.index)] = value;
                    } else {
                        data[controlParam.path][controlParam.arg.split("_")[0]] = value;
                    }
                }
            } else {
                if (controlParam.index !== undefined) {
                    if (data[controlParam.arg.split("_")[0]] === undefined)
                        data[controlParam.arg.split("_")[0]] = [];
                    data[controlParam.arg.split("_")[0]][parseInt(controlParam.index)] = value;
                } else {
                    data[controlParam.arg.split("_")[0]] = value;
                }
            }
        }

        await axios.post("http://" + this.address + "/json/state", data).catch(err => {
            console.log(err.code)
            ItemService.removeItem(this._id)
        });
        return this.fetch();
    }
}

module.exports = WLED;
