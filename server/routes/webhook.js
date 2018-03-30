const express = require('express')
const router = express.Router()
const ShopifyAPI = require('shopify-api-node')
const { verifyHmac, requireShop } = require('../middleware');

router.use(verifyHmac)
router.use(requireShop)

router.post('/app/uninstalled', (request, response, next) => {
  const { shop } = response.locals
  shop.uninstalled_on = new Date()
  shop.save()
  response.sendStatus(200)
})

module.exports = router
