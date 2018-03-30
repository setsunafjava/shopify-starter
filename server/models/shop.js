const mongoose = require('mongoose')
const ShopifyAPI = require('shopify-api-node')
const { DEFAULT_SETTINGS, SHOPIFY_API_KEY, APPLICATION_CHARGE, RECURRING_CHARGE } = require('../../config/env')
const DateDiff = require('date-diff')
const { Schema } = mongoose

Shop = new Schema({
  _id: String,
  domain: String,
  token: { type: String,  default: null },
  uninstalled_on: { type: Date, default: null },
  installed_on: { type: Date, default: null },
  trial_ends_on: { type: Date, default: null },
  prepaid_ends_on: { type: Date, default: null },
  last_active_charge: { type: Schema.Types.Mixed, default: null },
  settings: { type: Schema.Types.Mixed, default: DEFAULT_SETTINGS }
})

const apiStore = {}
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

Shop.virtual('app_url').get(function() {
  return `https://${this.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
})

Shop.methods.isActive = function() {
  return new Promise((resolve, reject) => {

    let isActive = !APPLICATION_CHARGE
    isActive = isActive || (!RECURRING_CHARGE && this.last_active_charge)
    isActive = isActive || (this.prepaid_ends_on || this.trial_ends_on)
    
    if (isActive) {
      return resolve(true)
    }

    if (!this.last_active_charge) {
      return resolve(false)
    }

    const today = new Date()
    let paidUntil = new Date(this.last_active_charge.billing_on)
    paidUntil.setDate(paidUntil.getDate() + 30)
    isActive = new DateDiff(paidUntil, today).days() > 0

    if (isActive) {
      return resolve(true)
    }
    
    // get the next charge
    const chargeType = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'
    const chargeId = this.last_active_charge.id

    this.api[chargeType].get({ since_id: chargeId, fields: 'id, billing_on, status'})
    .then(({ id, billing_on }) => {
      if (charge.status === 'active') {
        this.last_active_charge = { id, billing_on }
        return this.save().then(() => resolve(true))
      } else {
        this.last_active_charge = null
        return this.save().then(() => resolve(false))
      }
    })
    .catch(next)
  })
}

module.exports = mongoose.model('Shop', Shop)
