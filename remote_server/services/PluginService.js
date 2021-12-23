const fs = require('fs');
const Plugin = require('../models/Plugin');
const ItemService = require('./ItemService');

/**
 * Load all the Plugins listed in plugins.json
 */
exports.loadPlugins = function() {
    ItemService.items = []
    this.plugins = [];

    let plugins = JSON.parse(fs.readFileSync('plugins.json'));

    plugins.plugins.forEach(p => {
        //Load the plugin and register all the linked items
        let plugin = new Plugin(p);
        plugin.items.forEach(item => ItemService.registerItem(item));
        this.plugins.push(plugin);
    });
}

/**
 * Return the List of all loaded plugins
 * @returns {[Plugin]}
 */
exports.getPlugins = function() {
    return this.plugins;
}