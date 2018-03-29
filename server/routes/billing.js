const express = require('express')
const router = express.Router()
const { privateRoute } = require('../middleware')
const { NAME, URL } = require('../../config/env')
const { APPLICATION_CHARGE, RECURRING_CHARGE, FREE_TRIAL_DURATION } = require('../../config/env')


// determine free trial days
const calulateFreeTrial = (request, response, next) => {
  const { shop } = response.locals
  const { installed_on, uninstalled_on, trial_expiry, last_charge } = shop

  // if it's free or paid in full return 0, trial days dont do anything
  if (!APPLICATION_CHARGE || (last_charge && !RECURRING_CHARGE)) {
    response.locals.trialDays = 0
    return next()
  }

  // if never installed return trial days
  if (APPLICATION_CHARGE && !installed_on) {
    response.locals.trialDays = FREE_TRIAL_DURATION
    return next()
  }

  // if uninstalled before trial_days expired
  // return any leftover trial days
  if (trial_expiry && uninstalled_on && !last_charge) {
    const daysLeft = new DateDiff(new Date(trial_expiry), new Date(uninstalled_on))
    response.locals.trialDays = Math.max(0, daysLeft.days())
    return next()
  }
  
  // if uninstalled after being charged
  // check if it was cancelled during this month
  // add days to complete the month they've already paid for
  if (uninstalled_on && last_charge) {
    shop.api[chargeType].get({ application_charge_id: last_charge.charge_id })
    .then(({ cancelled_on }) => {
      if (!cancelled_on) return resolve(0)

      let endOfMonth = new Date()
      endOfMonth.setDate(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, 0)

      let cancelledOn = new Date(cancelled_on)

      let daysLeft = new DateDiff(endOfMonth, cancelledOn)
      response.locals.trialDays = Math.max(0, daysLeft.days())
      return next()
    })
  }
  
  return next({ status: 500, message: 'could not determine trial days' })
}

const createCharge = (request, response, next) => {
  const { shop, trialDays = 0 } = response.locals
  const { installed_on, uninstalled_on, trial_expiry, last_charge } = shop
  const chargeType = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'

  // if it's free, paid in full or there's trial days charge now
  if (!APPLICATION_CHARGE || (last_charge && !RECURRING_CHARGE) || trialDays > 0) {
    return response.redirect(shop.app_url)
  }

  // create a charge
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
}

router.use(privateRoute)
router.get('/install', calulateFreeTrial, createCharge)

router.use('/activate', (request, response, next) => {
  const { shop } = response.locals
  const { charge_id } = request.query
  const chargeType = RECURRING_CHARGE ? 'recurringApplicationCharge' : 'applicationCharge'
  shop.api[chargeType].activate(charge_id)
  .then((charge) => {
    console.log(charge)
    if (charge.status === 'active') {
      shop.last_charge = charge
      return shop.save().then(() => response.redirect(shop.app_url))
    } else {
      return response.redirect(shop.app_url)
    }
  })
  .catch(next)
})

module.exports = router