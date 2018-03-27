const express = require('express');
const router = express.Router();
const { privateRoute, sendLiquid } = require('../middleware');

router.use(privateRoute);
router.use(sendLiquid);

router.get('/', (req, res) => {
  // send some .liquid
  res.sendStatus(200);
});

module.exports = router;
