const express = require('express')
const router = express.Router()
const { verifyHmac, privateRoute } = require('../middleware')
const ShopifyAPI = require('shopify-api-node')

router.use(privateRoute)

router.post('/app/uninstalled', (request, response, next) => {
  const { shop } = response.locals
  
  shop.uninstalled_on = new Date()
  shop.save()


  response.sendStatus(200)
})

module.exports = router
