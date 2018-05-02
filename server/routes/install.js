const express = require('express')
const axios = require('axios')
const DateDiff = require('date-diff')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const generateNonce = require('nonce')()
const { Shop } = require('../models')
const { NAME, URL } = require('../../config/env')
const { NODE_ENV } = process.env
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_SCOPE } = require('../../config/env')
const { APPLICATION_CHARGE, RECURRING_CHARGE, FREE_TRIAL_DURATION } = require('../../config/env')
const { verifyHmac, requireShop } = require('../middleware');
const router = express.Router()
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

// dev installation route, disabled in production
router.get('/', (request, response, next) => {
  const { shop } = request.query;
  
  // handle errors
  if (NODE_ENV !== 'development') {
    return next({ status: 403, message: 'Forbidden' })
  } else if (!shop) {
    return next({ status: 422,  message: 'Missing shop param' })
  }

  // generage install authorization url
  const nonce = generateNonce()
  const authURL = `https://${shop}.myshopify.com/admin/oauth/authorize`
    + `?client_id=${SHOPIFY_API_KEY}`
    + `&scope=${SHOPIFY_APP_SCOPE.join(', ')}`
    + `&state=${nonce}`
    + `&redirect_uri=${URL}/install/callback`

  // ensure shop in db
  const update = { $setOnInsert: { _id: shop, domain: shop } }
  Shop.findByIdAndUpdate(shop, update, { upsert: true })
  .then(() => response.redirect(authURL))
  .catch(next)
})

// protect routes, require shop
router.use(verifyHmac)
router.use(requireShop)

// install permenant access token
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals
console.log('ko:' +shop.domain);
  // get the auth token
  const authURL = `https://${shop.domain}.myshopify.com/admin/oauth/access_token`
  axios.post(authURL, {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
    code: request.query.code,
  })
  .then((result) => {
    // save to the db
    console.log(result.data.access_token);
    shop.token = result.data.access_token
    shop.save().then(() => next())
    .catch(next)
  })
  .catch(next)
})

// install scriptTag
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals

  // check if the script-tag entry file exists
  // if it does and isn't empty setup the script-tag
  const scriptEntry = path.resolve(__dirname, '../../client/app/script-tag/index.js')
  fs.readFile(scriptEntry, 'utf8', (error, data) => {
    if (error || data.trim() === '') return next()

    // generate and add hmac query
    const nonce = generateNonce()
    const store = `${shop.domain}.myshopify.com`
    const message = `nonce=${nonce}&shop=${store}`
    const hmac = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(message).digest('hex')
    const query = `nonce=${nonce}&hmac=${hmac}`

    // install the script-tag
    shop.api.scriptTag.create({
      event: 'onload',
      src: `${URL}/assets/app/script-tag/main.js?${query}`
    })
    .then(() => next())
    .catch(next)
  })
})

// install webhooks
router.get('/callback', (request, response, next) => {
  const { shop } = response.locals

  // get all the webhook routes currently defined in the webhook route
  // if the route matches an available shopify webhook, add it to an array
  const webhooks = require('./webhook').stack.reduce((webhooks, endpoint) => {
    const path = endpoint.route ? endpoint.route.path.substring(1) : null
    const isWehook = avilableWebhooks.indexOf(path) > -1
    const isProcessed =  webhooks.indexOf(path) > -1
    if (isWehook && !isProcessed) {
      webhooks.push(path)
    }
    return webhooks
  }, [])

  // recursive function to install 
  // all the defined and valid webhooks
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
  const { trial_ends_on, prepaid_ends_on, installed_on, uninstalled_on, last_active_charge } = shop
  
  shop.trial_ends_on = null
  shop.prepaid_ends_on = null
  shop.uninstalled_on = null
  shop.installed_on = new Date()
  console.log('APPLICATION_CHARGE: ' + APPLICATION_CHARGE);
  if (APPLICATION_CHARGE && (!last_active_charge || RECURRING_CHARGE)) {
    // if there's a recurring charge or 
    // if it's not already paid check for free days

    let endsOn
    let daysLeft
  console.log('last_active_charge: ' + last_active_charge);
    if (last_active_charge && last_active_charge.id && (uninstalled_on || installed_on)) {
      // if charged before then dont bother checking free trial 
      // but check for left-over days from previous billing cycles
      // note: if the uninstall date is null check the install date
      // this can happen if the uninstall webhook isn't prompt

      endsOn = new Date(last_active_charge.billing_on)
      endsOn.setDate(endsOn.getDate() + 30)
      daysLeft = new DateDiff(endsOn, new Date(uninstalled_on || installed_on))
      daysLeft = Math.max(0, daysLeft.days())
      if (daysLeft > 0) {
        endsOn = new Date(shop.installed_on)
        endsOn.setDate(endsOn.getDate() + daysLeft)
        shop.prepaid_ends_on = endsOn
      }

    } else if (FREE_TRIAL_DURATION > 0) {
      console.log(FREE_TRIAL_DURATION);
              console.log('trial_ends_on: ' + trial_ends_on);
              console.log('uninstalled_on: ' + uninstalled_on);
              console.log('installed_on: ' + installed_on);

      if (!trial_ends_on && !installed_on) {
        // if never used add the trial

        endsOn = new Date(shop.installed_on)
        endsOn.setDate(endsOn.getDate() + FREE_TRIAL_DURATION)
        shop.trial_ends_on = endsOn
      } else if (trial_ends_on && (uninstalled_on || installed_on)) {
        // if used before check the uninstall date
        // note: if the uninstall date is null check the install date
        // this can happen if the uninstall webhook isn't prompt

        endsOn = new Date(trial_ends_on)
        daysLeft = new DateDiff(new Date(endsOn), new Date(uninstalled_on || installed_on))
        daysLeft =  Math.max(0, daysLeft.days())
        if (daysLeft > 0) {
          endsOn = new Date(shop.installed_on)
          endsOn.setDate(endsOn.getDate() + daysLeft)
          shop.trial_ends_on = endsOn
        }
        console.log('shop.trial_ends_on: ' + shop.trial_ends_on);
      }
    }
  }

  // save the shop then redirect to confirm a charge
  // or redirect to the app if a charge isn't needed (yet or at all)
  shop.save()
  .then((shop) => {
    if (shop.trial_ends_on || shop.prepaid_ends_on || !APPLICATION_CHARGE) {
      return response.redirect(shop.app_url)
    } else {
      const queryString = request.url.split('?')[1]
      response.set('Content-Type', 'text/html')
      response.redirect(`/billing/confirm?redirect=true&${queryString}`)
    }
  })
})

module.exports = router
