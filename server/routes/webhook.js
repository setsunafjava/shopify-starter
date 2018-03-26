const express = require('express');
const router = express.Router();
const { verifyHmac, withShop } = require('../middleware');
const ShopifyAPI = require('shopify-api-node');

// secure route and load shop
router.use(verifyHmac);
//router.use(withShop);

router.post('/uninstalled', (request, response, next) => {
  // cleanup, note the api won't work in this webhook
  response.sendStatus(200);
});

module.exports = router;
