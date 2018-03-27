const express = require('express');
const { privateRoute } = require('../middleware');
const { NAME, SHOPIFY_API_KEY, LIVECHAT_API_KEY } = require('../../config/env');
const router = express.Router();

// secure app and load shop
router.use(privateRoute);

// render the app
router.get('/', (request, response, next) => {
  const { domain, settings } = response.locals.shop.toObject()

  const data = {
    app: NAME,
    store: domain,
    shopifyKey: SHOPIFY_API_KEY,
    livechatKey: LIVECHAT_API_KEY,
    settings,
  }

  return response.render('app', {data})
})

module.exports = router;
