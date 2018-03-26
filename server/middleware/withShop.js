const { Shop } = require('../models');

const withShop = (request, response, next) => {
  let shop = request.query.shop || request.get('X-Shopify-Shop-Domain');
  if (!shop) return next({status: 500, message: 'Could not load shop'});
  shop = shop.split('.')[0];
  Shop.findById(shop).exec().then((result) => {
    if (!result) return next({status: 500, message: 'Could not load shop'});
    response.locals.shop = result;
    return next();
  });
}

module.exports = withShop;
