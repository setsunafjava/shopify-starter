const express = require('express');
const router = express.Router();
const { verifyHmac, withShop } = require('../middleware');

router.use(verifyHmac);
router.use(withShop);

router.post('/save', (request, response, next) => {
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
