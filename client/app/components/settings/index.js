import React, { Component } from 'react'
import { SettingToggle, TextStyle } from '@shopify/polaris'
import { withState } from 'react-simple-state'
import state from '../../state'

const Settings = ({ state: { settings: { enabled }, saveSettings } }) => (
  <SettingToggle
    action={{
      content: enabled ? 'Disable' : 'Enable',
      onAction: () => { 
        saveSettings({ enabled: !enabled }) 
      }
    }}
    enabled={enabled}
  >
    The hello world app is 
    <TextStyle variation="strong">
      {enabled ? ' enabled' : ' disabled'}
    </TextStyle>.
  </SettingToggle>
)

export default withState({ state })(Settings)