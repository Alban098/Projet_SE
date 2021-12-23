exports.items = [];

/**
 * Register an item into the service
 * @param item the Item to register
 */
exports.registerItem = function(item) {
    this.items[item.id] = item;
}

/**
 * Get an Item from its UUID
 * @param id the Item UUID
 * @returns {Item} the selected Item
 */
exports.getItem = function(id) {
    return this.items[id];
}

/**
 * Return all the connected Items
 * @returns {[Item]}
 */
exports.getAll = function() {
    return this.items;
}