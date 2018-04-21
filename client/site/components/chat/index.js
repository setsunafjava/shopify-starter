import React, { Component } from 'react';
import LiveChat from 'react-livechat';
import withReact from 'tynker-state-withReact';
import state from '../../state';

const Chat = ({ state: { livechatKey, lcsdk, loadLCSDK } }) => (
  <LiveChat 
    hide_chat_window={true}
    license={livechatKey} 
    onChatLoaded={loadLCSDK}
  />
);

export default withReact({ state })(Chat);