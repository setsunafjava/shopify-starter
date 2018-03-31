const { Shop } = require('../models')

// loads the shop from the database using the shop domain
// identified by the search query or x-shopify-shop-domain
// then assigns it to response.locals for other routes to use
const requireShop = (request, response, next) => {
  const domain = request.query.shop || request.get('X-Shopify-Shop-Domain')
  if (!domain) {
    return next({status: 500, message: 'Could not load shop'})
  }

  Shop.findById(domain.split('.')[0]).exec().then((shop) => {
    if (!shop) {
      return next({status: 500, message: 'Could not load shop'})
    } 

    response.locals.shop = shop
    return next()
  })
}

module.exports = requireShop
