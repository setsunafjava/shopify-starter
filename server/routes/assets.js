const express = require('express')
const path = require('path')
const router = express.Router()
const { withShop } = require('../middleware')
const ShopifyAPI = require('shopify-api-node')
const { Shop } = require('../models');

// must have a shop to use assets
// hmac verification not available
router.use(withShop);
router.use((request, response, next) => {
  const { shop } = response.locals
  response.set('X-Settings', JSON.stringify(shop.settings))
  response.header("Access-Control-Expose-Headers", "X-Settings");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.header("Access-Control-Allow-Origin", request.headers.origin);
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/')})
});

module.exports = router;
