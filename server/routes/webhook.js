const express = require('express');
const router = express.Router();
const { verifyHmac, privateRoute } = require('../middleware');
const ShopifyAPI = require('shopify-api-node');

// secure route and load shop
router.use(privateRoute);
router.post('/uninstalled', (request, response, next) => {
  const { shop } = response.locals;
  // cleanup, note the api won't work in this webhook
  shop.remove()
  .then(res => {console.log('success', res)})
  .catch(err => {console.log('err', err)})
  response.sendStatus(200);
});

module.exports = router;
