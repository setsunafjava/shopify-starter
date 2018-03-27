const express = require('express');
const { SHOPIFY_API_KEY } = require('../../config/env');
const { privateRoute } = require('../middleware');
const router = express.Router();

router.use(privateRoute)

// install permenant access token
router.get('/callback', (request, response, next) => {
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

// handle billing
router.get('/callback', (request, response, next) => {
  
})

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

// post isntall done - redirect to app in admin
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  const redirect = `https://${shop.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
  response.redirect(redirect)
})