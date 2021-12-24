'use strict';

const PluginService     = require('./services/PluginService')
const ItemService     = require('./services/ItemService')
const express    = require('express');
const { auth }   = require('express-oauth2-jwt-bearer');
const app        = express();
const router 	 = express.Router();
const routerSecure 	 = express.Router();
const port 	     = process.env.PORT || 8080;

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
//TODO Load from .env
const checkJwt = auth({
    audience: 'secret',
    issuerBaseURL: `secret`,
});

PluginService.loadPlugins().then(() => console.log(PluginService.getCount() + " plugins and " + ItemService.getCount() + " items loaded"));

app.use(express.json());

require('./routes/routes')(router);
app.use('/index/', router);

require('./routes/routesSecure')(routerSecure);
app.use('/api/', /*checkJwt,*/ routerSecure);

app.listen(port);

console.log(`App Runs on ${port}`);