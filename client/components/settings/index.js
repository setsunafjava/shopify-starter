import React, { Component } from 'react';
import { SettingToggle, TextStyle } from '@shopify/polaris';
import { withState } from 'react-simple-state';
import state from '../../state';

class Settings extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { settings, saveSettings } = this.props.state;
    const { enabled } = settings;
    return (
      <SettingToggle
        action={{
          content: enabled ? 'Disable' : 'Enable',
          onAction: () => { saveSettings({...settings, enabled: !enabled}) }
        }}
        enabled={enabled}
      >
        The hello world is <TextStyle variation="strong">{enabled ? 'enabled' : 'disabled'}</TextStyle>.
      </SettingToggle>
    )
  }
}

export default withState({ state })(Settings);