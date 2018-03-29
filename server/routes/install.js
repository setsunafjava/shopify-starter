const express = require('express')
const axios = require('axios')
const DateDiff = require('date-diff')
const generateNonce = require('nonce')()
const { Shop } = require('../models')
const { NAME, URL } = require('../../config/env')
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_SCOPE } = require('../../config/env')
const { APPLICATION_CHARGE, RECURRING_CHARGE, FREE_TRIAL_DURATION } = require('../../config/env')
const { privateRoute, redirectToApp } = require('../middleware')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const avilableWebhooks = [ 
  'carts/create', 'carts/update', 
  'checkouts/create', 'checkouts/delete', 'checkouts/update', 
  'collections/create', 'collections/delete', 'collections/update', 'collection_listings/add', 'collection_listings/remove', 'collection_listings/update', 
  'customers/create', 'customers/delete', 'customers/disable', 'customers/enable', 'customers/update', 
  'customer_groups/create', 'customer_groups/delete', 'customer_groups/update', 
  'draft_orders/create', 'draft_orders/delete', 'draft_orders/update', 
  'fulfillments/create', 'fulfillments/update', 'fulfillment_events/create', 'fulfillment_events/delete', 
  'orders/cancelled', 'orders/create', 'orders/delete', 'orders/fulfilled', 'orders/paid', 'orders/partially_fulfilled', 'orders/updated', ' order_transactions/create', 
  'products/create', 'products/delete', 'products/update', 'product_listings/add', 'product_listings/remove', 'product_listings/update', 
  'refunds/create', 
  'app/uninstalled', 'shop/update', 
  'themes/create', 'themes/delete', 'themes/publish', 'themes/update'
]


// install route
router.get('/', (request, response, next) => {
  const { shop } = request.query;
  if (!shop) {
    return next({
      status: 422, 
      message: 'Missing shop parameter'
    })
  }

  const nonce = generateNonce()
  const authURL = `https://${shop}.myshopify.com/admin/oauth/authorize`
    + `?client_id=${SHOPIFY_API_KEY}`
    + `&scope=${SHOPIFY_APP_SCOPE}`
    + `&state=${nonce}`
    + `&redirect_uri=${URL}/install/callback`

  const update = { 
    $setOnInsert: { 
      _id: shop, 
      domain: shop,
    }
  }

  Shop.findByIdAndUpdate(shop, update, { upsert: true })
  .then((shop) => response.redirect(authURL))
  .catch(next)
})

// secure the callback route and provide a shop
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

// install scriptTag
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  const scriptEntry = path.resolve(__dirname, '../../client/app/script-tag/index.js')
  fs.readFile(scriptEntry, 'utf8', (error, data) => {
    if (error || data.trim() === '') return next()
    shop.api.scriptTag.create({
      event: 'onload',
      src: `${URL}/assets/app/script-tag/main.js`
    })
    .then(() => next())
    .catch(next)
  })
})

// install webhooks using shop.api
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  const webhooks = require('./webhook').stack.reduce((webhooks, endpoint) => {
    const path = endpoint.route ? endpoint.route.path : null
    const isWehook = avilableWebhooks.indexOf(path) > -1
    const isProcessed =  webhooks.indexOf(path) > -1
    if (isWehook && !isProcessed) {
      webhooks.push(path)
    }
    return webhooks
  }, [])

  const installWebhooks = (webhooks) => {
    if (!webhooks.length) return next()
    const route = webhooks[0]
    shop.api.webhook.create({
      topic: route,
      address: `${URL}/webhook${route}`
    })
    .then(() => {
      webhooks.shift()
      installWebhooks(webhooks)
    })
    .catch(next)
  }
  installWebhooks(webhooks)
})

// handle billing
router.get('/callback', (request, response, next) => {
  // DO Billing last
  const { shop } = response.locals
  const { installed_on, uninstalled_on, trial_expiry, last_charge } = shop

  if (!installed_on) {
    shop.installed_on = new Date()
    if (APPLICATION_CHARGE === 0) return next()
    if (FREE_TRIAL_DURATION) {
      shop.trial_expiry = new Date()
      shop.trial_expiry.setDate(shop.trial_expiry.getDate() + FREE_TRIAL_DURATION)
      return next()
    } else {
      // do some billing
      const type = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'
      const options = {
        name: NAME,
        test: true,
        price: APPLICATION_CHARGE,
        return_url: `https://${shop.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
      }

      shop.api[type].create(options)
      .then(res => {
        console.log('charge result')
        console.log('activate by url redirect')
        console.log(res)
      })
      .catch(err => {
        console.log('charge error')
        console.log(err)
      })
    }
  }
  next()
})

// post install done - redirect to app in admin
router.use('/callback', (request, response, next) => {
  const { shop } = response.locals
  const redirect = `https://${shop.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
  response.redirect(redirect)
})

module.exports = router
