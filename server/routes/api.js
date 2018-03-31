const express = require('express')
const { verifyHmac, requireShop } = require('../middleware')
const router = express.Router()

// protect routes, require shop
router.use(verifyHmac)
router.use(requireShop)

// return the shop's app settings
router.get('/settings', (request, response, next) => {
  const { shop } = response.locals
  response.json(shop.settings)
})

// update the shop's app settings and return the update
router.post('/settings', (request, response, next) => {
  const { shop } = response.locals
  shop.settings = {
    ...shop.settings,
    ...request.body,
  }

  shop.save()
  .then(shop => response.json(shop.settings))
  .catch(next)
})

module.exports = router
