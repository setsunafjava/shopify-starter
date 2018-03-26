const mongoose = require('mongoose');
const ShopifyAPI = require('shopify-api-node');

Shop = mongoose.Schema({
  _id: String,
  domain: String,
  nonce: String,
  token: { type: String, default: null },
  settings: {
    enabled: { type: Boolean, default: true },
  }
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

module.exports = mongoose.model('Shop', Shop);
