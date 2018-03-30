const express = require('express');
const router = express.Router();
const { verifyHmac, requireShop } = require('../middleware');

router.use(verifyHmac)
router.use(requireShop)

router.get('/settings', (request, response, next) => {
  const { shop } = response.locals
  response.json(shop.settings)
})

router.post('/settings', (request, response, next) => {
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
