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
    },
    installed_on: new Date()
  }

  Shop.findByIdAndUpdate(shop, update, { upsert: true })
  .then(() => response.redirect(authURL))
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
      address: `${URL}/webhook/${route}`
    })
    .then(() => {
      webhooks.shift()
      installWebhooks(webhooks)
    })
    .catch(next)
  }
  installWebhooks(webhooks)
})

// determine if billing is needed
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
  const { trial_ends_on, prepaid_ends_on, uninstalled_on, last_active_charge } = shop
  
  shop.trial_ends_on = null
  shop.prepaid_ends_on = null
  shop.uninstalled_on = null

  // if there's a recurring charge or it's not already paid check for free days
  if (APPLICATION_CHARGE && (!last_active_charge || RECURRING_CHARGE)) {

    let endsOn
    let daysLeft

    // if trial days available and unused set trial expiry
    if (APPLICATION_CHARGE && !trial_ends_on && FREE_TRIAL_DURATION > 0) {
      endsOn = new Date(shop.installed_on)
      endsOn.setDate(endsOn.getDate() + FREE_TRIAL_DURATION)
      shop.trial_ends_on = endsOn
    }

    // if installed and uninstalled in the past
    // check if it was uninstalled with remaining trial days
    // if trial days remain, set a new trial expiry
    if (trial_ends_on && uninstalled_on && !last_active_charge) {
      daysLeft = new DateDiff(new Date(trial_ends_on), new Date(uninstalled_on))
      daysLeft =  Math.max(0, daysLeft.days())
      if (daysLeft > 0) {
        endsOn = new Date(shop.installed_on)
        endsOn.setDate(endsOn.getDate() + daysLeft)
        shop.trial_ends_on = endsOn
      }
    }
    
    // if installed then uninstalled after being charged
    // check to see if it was cancelled during this billing cycle
    // if it was, add days to complete the cycle they already paid for
    if (uninstalled_on && last_active_charge) {
      endsOn = new Date(last_active_charge.billing_on)
      endsOn.setDate(endsOn.getDate() + 30)
      daysLeft = new DateDiff(endsOn, new Date(uninstalled_on))
      daysLeft = Math.max(0, daysLeft.days())
      if (daysLeft > 0) {
        shop.prepaid_ends_on = endsOn
      }
    }
  }

  shop.save()
  .then((shop) => {
    if (shop.trial_ends_on || shop.prepaid_ends_on || !!APPLICATION_CHARGE) {
      return response.redirect(shop.app_url)
    } else {
      const queryString = request.url.split('?')[1]
      response.redirect(`/billing/create?${queryString}`)
    }
  })

})

module.exports = router
