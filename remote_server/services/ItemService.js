exports.clearItems = function() {
    this._items = [];
}

/**
 * Register an item into the service
 * @param item the Item to register
 */
exports.registerItem = function(item) {
    this._items[item.id] = item;
}

exports.removeItem = function(id) {
    this._items[id] = undefined;
}

/**
 * Get an Item from its UUID
 * @param id the Item UUID
 * @returns {Item} the selected Item
 */
exports.getItem = function(id) {
    return this._items[id];
}

/**
 * Return all the connected Items
 * @returns {[Item]}
 */
exports.getAll = function() {
    return this._items;
}

exports.getCount = function() {
    return Object.keys(this._items).length;
}