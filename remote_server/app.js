'use strict';

const PluginService     = require('./services/PluginService')
const ItemService     = require('./services/ItemService')
const express    = require('express');

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

const app        = express();
const router 	 = express.Router();
const routerSecure 	 = express.Router();
const port 	     = process.env.PORT || 8080;

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-i2b9orck.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://projet-se/auth/api',
    issuer: 'https://dev-i2b9orck.us.auth0.com/',
    algorithms: ['RS256']
});

PluginService.loadPlugins().then(() => console.log(PluginService.getCount() + " plugins and " + ItemService.getCount() + " items loaded"));

app.use(express.json());

require('./routes/routes')(router);
app.use('/index/', router);

require('./routes/routesSecure')(routerSecure);
app.use('/api/', jwtCheck, jwtAuthz(['admin:control']), routerSecure);

app.listen(port);

console.log(`App Runs on ${port}`);