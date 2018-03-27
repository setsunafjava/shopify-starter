import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app';
import './style.css';

function renderApp() {
  render(
    <AppContainer>
      <App/>
    </AppContainer>,
    document.getElementById('root')
  );
}

renderApp();
if (module.hot) {
  module.hot.accept();
}
