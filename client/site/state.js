import { State } from 'react-simple-state';
import axios from 'axios';

class App extends State {
  constructor(state = {}) {
    super(state);
    this.loadLCSDK = this.loadLCSDK.bind(this);
  }

  loadLCSDK({ lcsdk = null }) {
    if (this.lcsdk || !lcsdk) return;
    // there's a bug with lcsdk where it's available before the underlying functions are ready
    // set a timer and keep checking until the parent functions are ready
    const timer = setInterval(() => {
      if (window.LC_Invite && window.LC_API) {
        const data = {
          app: this.app,
          store: this.store,
        };
        clearInterval(timer)
        this.setState({ lcsdk })
        this.lcsdk.set_custom_variables(data)
      }
    }, 200);
  }
}

const initialState = {
  app: null,
  livechatKey: null,
  loading: false,
  error: null,
  lcsdk: null,
  ...window.data,
};

const app = new App(initialState);
export default app;