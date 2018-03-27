const verifyHmac = require('./verifyHmac');
const withShop = require('./withShop');
const ensureOrigin = require('./ensureOrigin');
const directInstall = require('./directInstall');
const redirectToApp = require('./redirectToApp');
const installAccessToken = require('./installAccessToken');
const sendLiquid = require('./sendLiquid');

/* PUBLIC ROUTES
 * =============
 * Use this middleware combo for routes that accept requests from a store's scriptTags
 * These routes cannot be hmac verified but: 
 * withShop will throw if a shop query param is not provided
 * ensureOrigin will then throw if the origin / referer doesn't match the shop's domain
*/
const publicRoute = [ withShop, ensureOrigin ];

/* PRIVATE ROUTES
 * ==============
 * Use this middleware combo for routes that accept requests from the embedded app
 * These routes are hmac verified and will throw if a shop cannot be loaded
*/
const privateRoute = [ verifyHmac, withShop ];

module.exports = {
  verifyHmac,
  withShop,
  ensureOrigin,
  publicRoute,
  privateRoute,
  directInstall,
  redirectToApp,
  installAccessToken,
  sendLiquid,
};