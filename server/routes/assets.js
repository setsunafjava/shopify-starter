const express = require('express')
const path = require('path')
const router = express.Router()
const { publicRoute, privateRoute } = require('../middleware')

router.use('/site', (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/site/')})
})

router.use('/app/script-tag', publicRoute, (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/script-tag/')})
})

router.use('/app/proxies', privateRoute, (request, response, next) => {
  response.set('Content-Type', 'application/liquid')
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/proxies/')})
})

router.use('/app', privateRoute, (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/app/')})
})

module.exports = router
