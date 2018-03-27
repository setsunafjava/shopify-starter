import React, { Component } from 'react';
import EASDK from './components/easdk';
import Settings from './components/settings';
import Chat from './components/chat';

class App extends Component {
  render() {
    return (
      <EASDK>
        <div style={{padding: '20px'}}>
          <Settings />
          <Chat /> 
        </div>
      </EASDK>
    );
  }
}

export default App;
