const Item = require("../../models/Item");
const http = require('http');


class THSensor extends Item {

    constructor(id, name, address, controls) {
        super(id, name, address, controls);
        console.log(this.address + " loaded");
    }

    fetch() {
        return this._send('GET', 'status=0');
    }

    propagate() {
        return this.fetch();
    }

    _send(method, data) {
        return new Promise((resolve, reject) => {
            let options = {
                host: this.address,
                path: '/api',
                method: method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            let item = this;
            let request = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    let status = JSON.parse(chunk)
                    for (let arg in status) {
                        if (item.controls[arg] !== undefined)
                            item.controls[arg].value = status[arg];
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
