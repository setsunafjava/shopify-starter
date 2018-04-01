import { Banner, Button, TextStyle } from '@shopify/polaris'
import React, { Component } from 'react'
import { withState } from 'react-simple-state'
import state from '../../state'

const Status = props => {
  const { isActive, prepaid_days_left, trial_days_left, createCharge, dismissStatus, statusDismissed } = props.state

  if (isActive && !prepaid_days_left && !trial_days_left) return null

  const title = !isActive ? 'App Disabled' : prepaid_days_left ? 'Prepaid' : 'Free Trial'
  const onDismiss = prepaid_days_left || trial_days_left ? dismissStatus : null
  const status = isActive ? 'info' : 'critical'

  let text
  if (!isActive) {
    text = 'Payment is expired'
  } else if (prepaid_days_left) {
    text = `${prepaid_days_left} Prepaid Days Left.`
      + 'If you have any questions about your prepaid days, '
      + 'or about upgrading to the paid plan, please let us know.'
  } else if (trial_days_left) {
    text = `${trial_days_left} Free Trial Days Left.`
      + 'If you have any questions about your free trial days, '
      + 'or about upgrading to the paid plan, please let us know.'
  }

  return statusDismissed ? null : (
    <div>
      <Banner 
        title={title}
        status={status}
        action={{ content: 'Confirm Billing', onAction: createCharge }}
        onDismiss={onDismiss}
      >
        {text}
      </Banner>
      <br />
    </div>
  )
}

export default withState({ state })(Status)