const express = require('express')
const router = express.Router()
const ShopifyAPI = require('shopify-api-node')
const { verifyHmac, requireShop } = require('../middleware');

// protect routes, require shop
router.use(verifyHmac)
router.use(requireShop)

// triggered when app is uninstalled
router.post('/app/uninstalled', (request, response, next) => {
  const { shop, io } = response.locals
  console.log(io);
  // set the uninstallation date and save
  shop.uninstalled_on = new Date()
  //shop.remove()
  shop.save()

  // return status 200, done synchronously
  // to avoid any duplicate webhook calls
  // as shopify has a timeout for a response
  response.sendStatus(200)
})

module.exports = router
