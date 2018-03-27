const { SHOPIFY_API_KEY } = require('../../config/env');

const redirectToApp = (request, response, next) => {
  const { shop } = response.locals
  const redirect = `https://${shop.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
  response.redirect(redirect)
}

module.exports = redirectToApp