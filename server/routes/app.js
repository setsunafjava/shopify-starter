const express = require('express');
const { privateRoute } = require('../middleware');
const { NAME, SHOPIFY_API_KEY, LIVECHAT_API_KEY } = require('../../config/env');
const router = express.Router();

// secure app and load shop
router.use(privateRoute);

// render the app
router.get('/', (request, response, next) => {
  const { shop } = response.locals
  const { domain, settings, prepaid_days_left, trial_days_left } = shop

  shop.isActive()
  .then(active => {
    const data = {
      app: NAME,
      store: domain,
      shopifyKey: SHOPIFY_API_KEY,
      livechatKey: LIVECHAT_API_KEY,
      trial_days_left,
      prepaid_days_left,
      active,
      settings,
    }

    return response.render('app', {data})
  })
})

module.exports = router;
