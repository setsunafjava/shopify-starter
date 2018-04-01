const express = require('express')
const env = require('../../config/env')
const { verifyHmac, requireShop } = require('../middleware')
const { NODE_ENV, NAME, SHOPIFY_API_KEY, LIVECHAT_API_KEY } = env
const router = express.Router()

// protect routes, require shop
router.use(verifyHmac)
router.use(requireShop)

// render the app with required data
router.get('/', (request, response, next) => {
  const { shop } = response.locals
  const { domain, settings, prepaid_days_left, trial_days_left } = shop

  shop.isActive()
  .then(isActive => {
    const data = {
      app: NAME,
      store: domain,
      shopifyKey: SHOPIFY_API_KEY,
      livechatKey: LIVECHAT_API_KEY,
      freeTrialDays: trial_days_left,
      prepaidDays: prepaid_days_left,
      isActive,
      settings,
    }

    if (NODE_ENV === 'development') {
      // include all data for debugging
      data.debug = { env, shop: shop.toObject() }
    }

    return response.render('app', {data})
  })
})

module.exports = router
