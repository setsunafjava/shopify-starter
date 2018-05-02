import React, { Component } from 'react'
import { SettingToggle, TextStyle } from '@shopify/polaris'
import withReact from 'tynker-state--withReact'
import app from '../../state'

const Settings = ({ app: { state: { settings: { enabled },app }, saveSettings } }) => (
  <SettingToggle
    action={{
      content: enabled ? 'Disable' : 'Enable',
      onAction: () => { 
        saveSettings({ enabled: !enabled }) 
      }
    }}
    enabled={enabled}
  >
    The {app} app is 
    <TextStyle variation="strong">
      {enabled ? ' enabled' : ' disabled'}
    </TextStyle>.
  </SettingToggle>
)

export default withReact({ app })(Settings)