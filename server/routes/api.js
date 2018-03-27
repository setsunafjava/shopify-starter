const express = require('express');
const router = express.Router();
const { publicRoute, privateRoute } = require('../middleware');

// public routes taking requests from stores
router.get('/settings', publicRoute, (request, response, next) => {
  const { shop } = response.locals
  response.json(shop.settings)
})

// private routes taking requests from embedded app
router.post('/settings', privateRoute, (request, response, next) => {
  const { shop } = response.locals;
  shop.settings = {
    ...shop.settings,
    ...request.body,
  };
  shop.save()
  .then(shop => {
    response.json(shop.settings);
  })
  .catch(next);
});

module.exports = router;
