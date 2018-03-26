const express = require('express');
const { verifyHmac, withShop } = require('../middleware');
const { NAME, URL, SHOPIFY_API_KEY, LIVECHAT_API_KEY } = require('../../config/env');
const router = express.Router();

// secure route and load shop
router.use(verifyHmac);
router.use(withShop);

// render the app
router.get('/', (request, response, next) => {
  const { domain, settings } = response.locals.shop.toObject()

  const data = {
    app: NAME,
    url: URL,
    store: domain,
    shopifyKey: SHOPIFY_API_KEY,
    livechatKey: LIVECHAT_API_KEY,
    settings,
  }

  return response.render('app', {data})
})

module.exports = router;
