import React, { Component } from 'react'
import LiveChat from 'react-livechat'
import { withState } from 'react-simple-state'
import state from '../../state'

const Chat = ({ state: { livechatKey, lcsdk, loadLCSDK } }) => (
  livechatKey ? (
    <LiveChat 
      hide_chat_window={true}
      license={livechatKey} 
      onChatLoaded={loadLCSDK}
    />
  ) : null
)

export default withState({ state })(Chat)