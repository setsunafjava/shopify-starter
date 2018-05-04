const express = require('express')
const path = require('path')
const router = express.Router()
const { verifyHmac, requireShop } = require('../middleware');

// serve any public files needed for the website
router.get('/site', (request, response, next) => {
  response.sendFile(request.path, { root: path.join(__dirname, '/../../assets/site/')})
})

// protect routes, require shop
router.use(verifyHmac)
router.use(requireShop)

// serve the script-tag if the account is active
router.get('/app/script-tag/:path', (request, response, next) => {
  console.log('go here111111111111111');
  const { shop } = response.locals
  const { query : {type} } = request;
  shop.isActive()
  .then(active => {
    console.log('go here: '+ active);
    if (active) {
      console.log('aa: '+ request.path);
      const root = path.join(__dirname, '/../../assets/app/script-tag/')
      return response.sendFile(request.params.path, { root })
    } else {
      return response.status(403).send('App not active')
    }
  })
})

// router.get('/app/script-tag/:path', (request, response, next) => {
//   console.log(request.params);
  
// })



// serve proxies if the account is active
router.get('/app/proxies', (request, response, next) => {
  const { shop } = response.locals
  shop.isActive()
  .then(active => {
    if (active) {
      const root = path.join(__dirname, '/../../assets/app/proxies/')
      response.set('Content-Type', 'application/liquid')
      return response.sendFile(request.path, { root })
    } else {
      response.status(403)
      response.send('App not active')
      return       
    }
  })
})

// serve the embedded app assets
router.get('/app', (request, response, next) => {
    console.log('aa: '+ request.path);
  const root = path.join(__dirname, '/../../assets/app/')
  response.sendFile(request.path, { root })
})

module.exports = router
