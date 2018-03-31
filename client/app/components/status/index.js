import React, { Component } from 'react';
import { Banner, Button } from '@shopify/polaris';
import { withState } from 'react-simple-state';
import state from '../../state';

class Status extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { active, prepaid_days_left, trial_days_left, createCharge } = this.props.state;
    return (
      <div>
        <Banner title='App Disabled'>
          <p style={{ marginBottom: '10px' }}>
            No more free days you'll have to start paying now
          </p>
          <Button onClick={createCharge}>Upgrade</Button>
        </Banner>
      </div>
    )
  }
}

export default withState({ state })(Status);