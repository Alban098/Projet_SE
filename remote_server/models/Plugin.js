const fs = require('fs');
const { randomUUID } = require('crypto');

class Plugin {

    /**
     * The name of the Plugin
     * @private
     */
    _name;

    /**
     * The Path to the Plugin main Class
     * @private
     */
    _class_file;

    /**
     * The Path to the Plugin config file
     * @private
     */
    _config_file;

    /**
     * List of all the items connected via this Plugin
     * @private
     */
    _items;

    constructor(json) {
        this._name = json.name;
        this._class_file = "./../plugins/" + this._name + "/" + json.class;
        this._config_file = "./plugins/" + this._name + "/" + json.config;
        this._items = [];
        const itemClass = require(this._class_file);

        //Create each item and populate them according to config file
        let config = JSON.parse(fs.readFileSync(this._config_file));
        config.items.forEach(item => {
            this._items.push(new itemClass(randomUUID(), item.name, item.address, item.controls))
        })
    }

    get name() {
        return this._name;
    }

    get items() {
        return this._items;
    }
}

module.exports = Plugin;
