const ItemService = require('../services/ItemService');
const PluginService = require('../services/PluginService');

exports.plugins = [];

exports.indexAction = async function(req, res) {
    console.log(req.headers);
    res.json(req.headers)
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
    //List of items to return
    let items = {items: []};

    //For each item
    for (let id in ItemService.getAll()) {
        let item = ItemService.getItem(id);

        //If it exist, push its status to the list
        if (item !== undefined && await item.isConnected()) {
            let json = await item.generateJSONMetaData(true)
            items.items.push(json);
        }
    }

    //return the list
    res.json(items);
}

/**
 * Example JSON Request
    {
        "id": "5caa7157-1a9e-4a6f-ac3e-761ec30cbd36",
        "controls": [
            {"id": "3b9aa06c-6f2c-449e-8ae0-a488a2246464", "value": 255},
            {"id": "fd1a63e8-b9b2-4d1f-8900-a590e013e916", "value": 16711935}
        ]
    }

    Response : Same as Synchronize with the ID of the altered Item
 */
exports.applyAction = async function(req, res) {

    //JSON Object containing the new status of the item (after changes are propagated)
    let json = {};

    //get the ID
    let id = req.body.id;

    //If the id exist in the API
    if (id !== undefined) {
        let item = ItemService.getItem(id);
        //If the item exist in the API
        if (item !== undefined && await item.isConnected()) {

            //Get all the altered controls
            let controls = req.body.controls;
            if (controls !== undefined) {
                item.updateControls(controls);
                //propagate changes and wait for the
                await item.propagate();
            }
            json = await item.toJSON(false);
        } else {
            json.error = "Invalid item ID !"
        }
    } else {
        json.error = "Please specify an ID !"
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
    //List of Item status to return
    let json = {items: []};

    //Fetch each status and append them to the list
    for (let item in ItemService.getAll()) {
        if (ItemService.getAll()[item] !== undefined && await ItemService.getAll()[item].isConnected())
            json.items.push(await ItemService.getAll()[item].toJSON(true));
    }

    //return the list
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
    //JSON Object to return
    let json = {};

    //Get the ID
    let id = req.body.id;
    //If the ID exist, fetch the item
    if (id !== undefined) {
        let item = ItemService.getItem(id);

        //If the item exist, convert to JSON with a pre refetch of it's status
        if (item !== undefined  && await item.isConnected())
            json = await item.toJSON(true);
        else
            json.error = "Invalid item ID !"
    } else {
        json.error = "Please specify an ID !"
    }

    //return the Item JSON
    res.json(json);
}

exports.reloadAction = async function(req, res) {
    await PluginService.loadPlugins();
    res.json({status: "Reload successful (" + PluginService.getCount() + " plugins and " + ItemService.getCount() + " items)", code: "200"});
}