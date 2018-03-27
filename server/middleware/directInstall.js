const generateNonce = require('nonce')();
const { Shop } = require('../models');
const { SHOPIFY_API_KEY, SHOPIFY_APP_SCOPE, URL } = require('../../config/env');

const directInstall = (request, response, next) => {
  const { shop } = request.query;
  if (!shop) {
    return next({
      status: 422, 
      message: 'Missing shop parameter'
    })
  }

  const domain = shop
  const nonce = generateNonce()
  const authURL = `https://${shop}.myshopify.com/admin/oauth/authorize`
    + `?client_id=${SHOPIFY_API_KEY}`
    + `&scope=${SHOPIFY_APP_SCOPE}`
    + `&state=${nonce}`
    + `&redirect_uri=${URL}/install/callback`

  Shop.findByIdAndUpdate(shop, { _id: shop, domain, nonce }, { upsert: true })
  .then((shop) => {
    return response.redirect(authURL)
  }).catch(next)
}

module.exports = directInstall