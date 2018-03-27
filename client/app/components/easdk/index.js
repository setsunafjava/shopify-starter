import React, { Component } from 'react';
import { withState } from 'react-simple-state';
import state from '../../state';
import { EmbeddedApp } from '@shopify/polaris/embedded';

const EASDK = ({ state: { store, shopifyKey, easdk, loadEASDK }, children, ...props }) => {
  const shopOrigin = `https://${store}.myshopify.com`;
  return (
    <EmbeddedApp shopOrigin={shopOrigin} apiKey={shopifyKey} ref={loadEASDK}>
      <div>
        {children}
      </div>
    </EmbeddedApp>
  )
}

export default withState({ state })(EASDK);