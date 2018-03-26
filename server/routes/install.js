const axios = require('axios');
const express = require('express');
const generateNonce = require('nonce')();
const { Shop } = require('../models');
const { verifyHmac, withShop } = require('../middleware');
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_SCOPE, URL } = require('../../config/env');
const router = express.Router();

// install the app on shopify store admin
router.get('/', (request, response, next) => {
  const { shop } = request.query;
  if (!shop) {
    return next({
      status: 422, 
      message: 'Missing shop parameter'
    })
  }

  const domain = shop
  const nonce = generateNonce()
  const authURL = `https://${shop}.myshopify.com/admin/oauth/authorize`
    + `?client_id=${SHOPIFY_API_KEY}`
    + `&scope=${SHOPIFY_APP_SCOPE}`
    + `&state=${nonce}`
    + `&redirect_uri=${URL}/install/callback`

  Shop.findByIdAndUpdate(shop, { _id: shop, domain, nonce }, { upsert: true })
  .then((shop) => {
    response.redirect(authURL)
  }).catch(next)
})

// secure route and load shop
router.use('/callback', verifyHmac)
router.use('/callback', withShop)

// install permenant access token
router.use('/callback', (request, response, next) => {
  const { code } = request.query
  const { shop } = response.locals
  const authURL = `https://${shop.domain}.myshopify.com/admin/oauth/access_token`

  axios.post(authURL, {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
    code,
  })
  .then((result) => {
    shop.token = result.data.access_token
    shop.save()
    .then(() => next())
    .catch(next)
  })
  .catch(next)
})

// install scriptTags using shop.api
router.use('/callback', (request, response, next) => {
  const { shop } = response.locals
  shop.api.scriptTag.create({
    event: 'onload',
    src: `${URL}/assets/scriptTags/index.js`
  })
  .then(() => next())
  .catch(next)
})

// install webhooks using shop.api
router.use('/callback', (request, response, next) => {
  const { shop } = response.locals;
  shop.api.webhook.create({
    topic: 'app/uninstalled',
    address: `${URL}/webhook/uninstalled`
  })
  .then(() => next())
  .catch(next)
})

// install done - redirect to app in admin
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  const redirect = `https://${shop.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
  response.redirect(redirect)
})

module.exports = router
