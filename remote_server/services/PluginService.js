const fs = require('fs');
const Plugin = require('../models/Plugin');
const ItemService = require('./ItemService');

/**
 * Load all the Plugins listed in plugins.json
 */
exports.loadPlugins = async function () {
    ItemService.clearItems();
    this._plugins = [];

    let plugins = JSON.parse(fs.readFileSync('plugins.json'));

    await plugins.plugins.forEach(p => {
        //Load the plugin and register all the linked items
        let plugin = new Plugin(p);
        plugin.items.forEach(item => ItemService.registerItem(item));
        this._plugins.push(plugin);
    });
}

/**
 * Return the List of all loaded plugins
 * @returns {[Plugin]}
 */
exports.getAll = function() {
    return this._plugins;
}

exports.getCount = function() {
    return Object.keys(this._plugins).length;
}