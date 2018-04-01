import React, { Component } from 'react';
import { withState } from 'react-simple-state';
import state from '../../state';
import { EmbeddedApp } from '@shopify/polaris/embedded';
import { Page } from '@shopify/polaris';

const EASDK = ({ state: { store, shopifyKey, easdk, loadEASDK }, children }) => (
  <EmbeddedApp 
    shopOrigin={`https://${store}.myshopify.com`} 
    apiKey={shopifyKey} 
    ref={loadEASDK}
  >
    <Page>
      {children}
    </Page>
  </EmbeddedApp>
)

export default withState({ state })(EASDK);
