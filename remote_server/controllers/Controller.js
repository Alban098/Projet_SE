const ItemService = require('../services/ItemService')

exports.plugins = [];

exports.indexAction = async function(req, res) {

}

/**
 * Request : Get without parameters
 *
 * Example JSON Response
    {
        "items": [
            {
                "id": "f78dc826-2f87-4135-9817-22bdfd4b655e",
                "name": "RGB Strip 1",
                "controls": [
                    {"id": "0", "name": "Intensity", "type": "int", "min": 0, "max": 255},
                    {"id": "1", "name": "Color", "type": "color"}
                ]
            }
        ]
    }
 */
exports.fetchItemsAction = async function(req, res) {
    let items = {items: []};
    for (let id in ItemService.getAll()) {
        let item = ItemService.getItem(id);
        let jsonControls = [];
        for (let id in item.controls) {
            let control = item.controls[id];
            let json = {id: control.id, name: control.name, type: control.type};
            if (control.choices !== undefined)
                json.choices = control.choices;
            jsonControls.push(json);
        }
        let jsonItem = {
            id: item.id,
            name: item.name,
            controls: jsonControls
        }
        items.items.push(jsonItem);
    }

    res.json(items);
}

/**
 * Example JSON Request
    {
        "items": [
            {
                "id": "f78dc826-2f87-4135-9817-22bdfd4b655e",
                "controls": [
                    {"id": "0", "value": 255},
                    {"id": "1", "value": 16711935}
                ]
            }
        ]
    }
    Response : Same as Synchronize with the ID of the altered Item
 */
exports.applyAction = async function(req, res) {
    let json = {};
    let id = req.body.item.id;
    if (id !== undefined) {
        let item = ItemService.getItem(id);
        if (item !== undefined) {
            let controls = req.body.item.controls;
            for (let control in controls) {
                if (item.getControl(controls[control].id) !== undefined && item.getControl(controls[control].id).editable)
                    item.getControl(controls[control].id).value = (controls[control].value);
            }
            await item.propagate();
            json = await item.toJSON();
        }
    }
    res.json(json);
}

/**
 * Request : Get without parameters
 *
 * Example JSON Response
    {
        "items": [
            {
                "id": "2f15b7dc-3ab7-4e73-a214-63ca6a02cc81",
                "name": "LED Strip 1",
                "controls": [
                    {"id": "0", "value": 255},
                    {"id": "1", "value": 16711935},
                    {"id": "2", "value": 1},
                    {"id": "3", "value": 255},
                    {"id": "4", "value": 0},
                    {"id": "5", "value": 1}
                ]
            }
        ]
    }
 */
exports.synchronizeAllAction = async function(req, res) {
    let json = {items: []};
    for (let item in ItemService.getAll()) {
        json.items.push(await ItemService.getAll()[item].toJSON());
    }
    res.json(json);
}

/**
 * Request : Get
 * Example JSON Response
    {
        "id": "2f15b7dc-3ab7-4e73-a214-63ca6a02cc81",
        "name": "LED Strip 1",
        "controls": [
            {"id": "0", "value": 255},
            {"id": "1", "value": 16711935},
            {"id": "2", "value": 1},
            {"id": "3", "value": 255},
            {"id": "4", "value": 0},
            {"id": "5", "value": 1}
        ]
    }
 */
exports.synchronizeAction = async function(req, res) {
    let json = {};
    let id = req.body.id;
    if (id !== undefined) {
        let item = ItemService.getItem(id);
        console.log(item);
        if (item !== undefined)
            json = await item.toJSON();
    }
    res.json(json);
}