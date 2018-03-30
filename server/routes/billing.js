const express = require('express')
const router = express.Router()
const { NAME, URL } = require('../../config/env')
const { APPLICATION_CHARGE, RECURRING_CHARGE } = require('../../config/env')
const { verifyHmac, requireShop } = require('../middleware');

router.use(verifyHmac)
router.use(requireShop)

router.get('/create', (request, response, next) => {
  const { shop } = response.locals
  const chargeType = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'

  const options = {
    name: NAME,
    test: true,
    price: APPLICATION_CHARGE,
    return_url: `${URL}/billing/activate?${request.url.split('?')[1]}`
  }

  shop.api[chargeType].create(options)
  .then(({ confirmation_url }) => {
    return response.redirect(confirmation_url)
  })
  .catch(err => {
    return reject(err)
  })

})

router.use('/activate', (request, response, next) => {
  const { shop } = response.locals
  const chargeId = request.query.charge_id
  const chargeApi = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'
  const chargeProp = RECURRING_CHARGE ? 'recurring_application_charge' : 'application_charge'

  shop.api[chargeApi].activate(chargeId)
  .then(({ [chargeProp]: { id, billing_on, status } }) => {
    if (status === 'active') {
      shop.last_active_charge = { id, billing_on }
      return shop.save().then(() => response.redirect(shop.app_url))
    } else {
      return response.redirect(shop.app_url)
    }
  })
  .catch(next)
})

module.exports = router