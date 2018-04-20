import { Banner, Button, TextStyle } from '@shopify/polaris'
import React, { Component } from 'react'
import { withState } from 'react-simple-state'
import app from '../../state'

const Status = props => {
  const { isActive, prepaidDays, freeTrialDays, createCharge, statusDismissed } = props.app.state
  const { dismissStatus } = props.app

  if (isActive && !prepaidDays && !freeTrialDays) return null

  const title = !isActive ? 'App Disabled' : prepaidDays ? 'Prepaid' : 'Free Trial'
  const onDismiss = prepaidDays || freeTrialDays ? dismissStatus : null
  const status = isActive ? 'info' : 'critical'

  let text
  if (!isActive) {
    text = 'Payment is expired'
  } else if (prepaidDays) {
    text = `You have ${prepaidDays} Prepaid Days Left. This is likely from uninstalling during a billing cycle. `
      + 'If you have any questions contact us via chat support. '
      + 'To avoid lapse in service, confirm billing before free trial is over.'
  } else if (freeTrialDays) {
    text = `You have ${freeTrialDays} free trial days Left. `
      + 'If you have any questions contact us via chat support. '
      + 'To avoid lapse in service, confirm billing before free trial is over.'
  }

  return statusDismissed ? null : (
    <div>
      <Banner 
        title={title}
        status={status}
        action={{ content: 'Confirm Billing Now', onAction: createCharge }}
        onDismiss={onDismiss}
      >
        {text}
      </Banner>
      <br />
    </div>
  )
}

export default withState({ app })(Status)