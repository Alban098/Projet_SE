'use strict';

const Controller = require('../controllers/Controller')

module.exports = router => {

    router.get('/', Controller.indexAction);
    router.get('/reload', Controller.reloadAction);
    router.get('/fetch', Controller.fetchItemsAction);
    router.post('/apply', Controller.applyAction);
    router.post('/synchronize', Controller.synchronizeAction);
    router.get('/synchronize/all', Controller.synchronizeAllAction);
}