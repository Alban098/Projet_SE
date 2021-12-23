'use strict';

const Controller = require('../controllers/Controller')

module.exports = router => {

    router.get('/', Controller.indexAction);

    /* ======================= The above routes should be placed behind Auth0 ======================= */
    router.get('/fetch', Controller.fetchItemsAction);
    router.post('/apply', Controller.applyAction);
    router.get('/synchronize', Controller.synchronizeAction);
    router.get('/synchronize/all', Controller.synchronizeAllAction);
}