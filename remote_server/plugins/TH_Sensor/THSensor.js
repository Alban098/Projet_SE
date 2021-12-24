const Item = require("../../models/Item");
const http = require('http');
const {randomUUID} = require("crypto");


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
        return this._send('GET', 'status=0');
    }

    propagate() {
        return new Promise((resolve => {
            resolve(0);
        }));
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
            });
            request.write(data);
            request.end();
        });
    }
}

module.exports = THSensor;
