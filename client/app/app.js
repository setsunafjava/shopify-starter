import React, { Component } from 'react'
import EASDK from './components/easdk'
import Status from './components/status'
import Settings from './components/settings'
import Chat from './components/chat'

class App extends Component {
  render() {
    return (
      <EASDK>
        <Status />
        <Settings />
      </EASDK>
    )
  }
}

export default App
