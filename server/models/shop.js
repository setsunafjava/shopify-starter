const mongoose = require('mongoose')
const ShopifyAPI = require('shopify-api-node')
const { DEFAULT_SETTINGS, SHOPIFY_API_KEY } = require('../../config/env')
const { Schema } = mongoose

Shop = new Schema({
  _id: String,
  domain: String,
  token: { type: String,  default: null },
  uninstalled_on: { type: Date, default: null },
  installed_on: { type: Date, default: null },
  trial_expiry: { type: Date, default: null },
  last_charge: { type: Schema.Types.Mixed, default: null },
  settings: { type: Schema.Types.Mixed, default: DEFAULT_SETTINGS }
});

const apiStore = {};
Shop.virtual('api').get(function() {
  if (apiStore[this.domain]) {
    return apiStore[this.domain];
  } else {
    const api = new ShopifyAPI({
      shopName: this.domain,
      accessToken: this.token,
    });
    apiStore[this.url] = api;
    return api;
  }
});

Shop.virtual('app_url').get(function() {
  return `https://${this.domain}.myshopify.com/admin/apps/${SHOPIFY_API_KEY}`
})

module.exports = mongoose.model('Shop', Shop);
