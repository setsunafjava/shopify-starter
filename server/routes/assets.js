const express = require('express')
const path = require('path')
const router = express.Router()
const { publicRoute, privateRoute } = require('../middleware')

router.use('/client', privateRoute, (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/client/')})
});

router.use('/scriptTags', publicRoute, (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/scriptTags/')})
});

module.exports = router;
