const express = require('express');
const { privateRoute, directInstall, installAccessToken, redirectToApp } = require('../middleware');
const { SHOPIFY_API_KEY, URL } = require('../../config/env');
const router = express.Router();

router.get('/', directInstall)
router.use(privateRoute)
router.get('/callback', installAccessToken)

// install scriptTags using shop.api
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  shop.api.scriptTag.create({
    event: 'onload',
    src: `${URL}/assets/scriptTags/index.js`
  })
  .then(() => next())
  .catch(next)
})

// install webhooks using shop.api
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals;
  shop.api.webhook.create({
    topic: 'app/uninstalled',
    address: `${URL}/webhook/uninstalled`
  })
  .then(() => next())
  .catch(next)
})

// install done - redirect to app in admin
router.get('/callback', redirectToApp)

module.exports = router
