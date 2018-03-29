const verifyHmac = require('./verify-hmac');
const withShop = require('./with-shop');
const ensureOrigin = require('./ensure-origin');
const redirectToApp = require('./redirect-to-app');

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
  redirectToApp,
};