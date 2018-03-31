const mongoose = require('mongoose')
const ShopifyAPI = require('shopify-api-node')
const { DEFAULT_SETTINGS, SHOPIFY_API_KEY, APPLICATION_CHARGE, RECURRING_CHARGE } = require('../../config/env')
const DateDiff = require('date-diff')
const { Schema } = mongoose

// create the shop schema
Shop = new Schema({
  _id: String,
  domain: String,
  token: { type: String,  default: null },
  uninstalled_on: { type: Date, default: null },
  installed_on: { type: Date, default: null },
  trial_ends_on: { type: Date, default: null },
  prepaid_ends_on: { type: Date, default: null },
  last_active_charge: { 
    id: { type: Number, default: null },
    billing_on: { type: Date, default: null },
  },
  settings: { type: Schema.Types.Mixed, default: DEFAULT_SETTINGS }
})

const apiStore = {}

// loads shop's api library using the access token
// and caches it for future access
Shop.virtual('api').get(function() {
  if (apiStore[this.domain]) {
    return apiStore[this.domain]
  } else {
    const api = new ShopifyAPI({
      shopName: this.domain,
      accessToken: this.token,
    })
    apiStore[this.url] = api
    return api
  }
})

// calculates and returns any trial days left for the shop
Shop.virtual('trial_days_left').get(function() {
  if (!this.trial_ends_on) return 0

  const today = new Date()
  const endsOn = new Date(this.trial_ends_on)
  const daysLeft = new DateDiff(endsOn, today).days()

  if (daysLeft > 0) return daysLeft
  this.trial_ends_on = null
  this.save()

  return 0
})

// calculates and returns any prepaid days left for the shop
Shop.virtual('prepaid_days_left').get(function() {
  if (!this.prepaid_ends_on) return 0

  const today = new Date()
  const endsOn = new Date(this.prepaid_ends_on)
  const daysLeft = new DateDiff(endsOn, today).days()
  if (daysLeft > 0) return daysLeft
  this.prepaid_ends_on = null
  this.save()
  
  return 0
})

// returns the embedded app url for the shop
Shop.virtual('app_url').get(function() {
  return `https://${this.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
})

// checks whether or not the shop is currently active (billing)
// if the currently stored charge is expired, it checks for the next one
// and stores it (if active) or nulls the charge effectively de-activating
Shop.methods.isActive = function() {
  return new Promise((resolve, reject) => {

    // if the app is free, paid in full or running free days it's active
    // otherwise if there's no active charge it's not active
    let isActive = !APPLICATION_CHARGE
    isActive = isActive || (!RECURRING_CHARGE && this.last_active_charge)
    isActive = isActive || (this.prepaid_ends_on || this.trial_ends_on)
    
    if (isActive) {
      return resolve(true)
    } else if (!this.last_active_charge) {
      return resolve(false)
    }

    // there's an active charge but we don't know if it's expired yet
    // check when the active charge will end and see if we're still in the cycle
    // if we are the account is active
    const today = new Date()
    let paidUntil = new Date(this.last_active_charge.billing_on)
    paidUntil.setDate(paidUntil.getDate() + 30)
    isActive = new DateDiff(paidUntil, today).days() > 0
    
    if (isActive) {
      return resolve(true)
    }
    
    // the last active charge is expired so we need to get the 
    // next active charge using the shop api
    // if it's found and active save it to last_active_charge
    // if none exists null the last_active_charge
    // return result
    const opts = {
      since_id: this.last_active_charge.id,
      fields: 'id, billing_on, status',
    }

    this.api.recurringApplicationCharge.get(opts)
    .then(({ recurring_application_charges: charges }) => {
      const activeCharge = charges.filter(({ status }) => status === 'active')[0] || null
      if (!activeCharge) {
        this.last_active_charge = null
      } else {
        this.last_active_charge = Object.assign({}, activeCharge)
      }

      this.save()
      .then(() => resolve(!!activeCharge))
      .catch(next)
    })
    .catch(next)
  })
}

module.exports = mongoose.model('Shop', Shop)
