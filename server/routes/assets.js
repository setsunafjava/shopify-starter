const express = require('express')
const path = require('path')
const router = express.Router()
const { verifyHmac, requireShop } = require('../middleware');

router.use('/site', (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/site/')})
})

router.use(verifyHmac)
router.use(requireShop)

router.use('/app/script-tag', (request, response, next) => {
  const { shop } = response.locals
  shop.isActive()
  .then(active => {
    if (active) {
      return response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/script-tag/')})
    } else {
      response.status(403)
      response.send('App not active')
      return       
    }
  })
})

router.use('/app/proxies', (request, response, next) => {
  const { shop } = response.locals
  response.set('Content-Type', 'application/liquid')

  shop.isActive()
  .then(active => {
    if (active) {
      return response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/proxies/')})
    } else {
      response.status(403)
      response.send('App not active')
      return       
    }
  })
})

router.use('/app', (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/')})
})

module.exports = router
