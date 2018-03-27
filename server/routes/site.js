const express = require('express');
const router = express.Router();
const { NAME, LIVECHAT_API_KEY } = require('../../config/env');


// render the website
router.get('/', (request, response, next) => {
  const data = {
    app: NAME,
    livechatKey: LIVECHAT_API_KEY,
  }
  return response.render('site', {data})
})

module.exports = router;
