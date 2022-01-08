const Item = require("../../models/Item");
const ItemService = require('../../services/ItemService');
const http = require('http');
const { randomUUID } = require("crypto");


class RGBStrip extends Item {

    _api_URL = "/api";

    _pluginsControls = [
        {arg: "palette", name: "Palette", type: "combo", fill_arg: "palettes=0"},
        {arg: "effect", name: "Effect", type: "combo", fill_arg: "effects=0"},
        {arg: "primary_color", name: "Primary Color", type: "color"},
        {arg: "secondary_color", name: "Secondary Color", type: "color"},
        {arg: "tertiary_color", name: "Tertiary Color", type: "color"},
        {arg: "speed", name: "Effect Speed", type: "int"},
        {arg: "intensity", name: "Effect Intensity", type: "int"},
        {arg: "brightness", name: "Brightness", type: "int"}
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
                let options = {
                    host: this.address,
                    path: this._api_URL,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(pluginsControl.fill_arg)
                    }
                };
                let self = this;
                let request = http.request(options, (res) => {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        //Fetch choices and then save them to the ControlUnit
                        let choices = JSON.parse(chunk);
                        for (let choice in choices)
                            controlUnit.choices[choices[choice]] = choice;
                        self.addControl(controlUnit)
                    });
                    res.on('error', function(err) {
                        console.error(this.name + " : Combo (" + name + ") failed to report choices [" + err.name + "]");
                        ItemService.removeItem(this._id);
                    })
                });
                request.write(pluginsControl.fill_arg);
                request.end();
            } else {
                this.addControl(controlUnit);
            }
        }
    }

    fetch() {
        return this._send('GET', 'status=0');
    }

    propagate() {
        let data = "";
        for (let id in this.controls)
            data += this._control_args_by_id[id] + "=" + this.controls[id].value + "&";
        return this._send('POST', data);
    }

    _send(method, data) {
        return new Promise((resolve) => {
            let options = {
                host: this.address,
                path: this._api_URL,
                method: method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            let self = this;
            let request = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    let status = JSON.parse(chunk);
                    for (let arg in status) {
                        if (self.controls[self._control_ids_by_arg[arg]] !== undefined)
                            self.controls[self._control_ids_by_arg[arg]].value = status[arg];
                    }
                    resolve(0);
                });
                res.on('error', function(err) {
                    console.error(this.name + " (" + self.address + ") failed to respond [" + err.name + "]");
                    ItemService.removeItem(this._id);
                    resolve(0);
                })
            });
            request.write(data);
            request.end();
        });
    }
}

module.exports = RGBStrip;
