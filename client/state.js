import { State } from 'react-simple-state';
import axios from 'axios';

class App extends State {
  constructor(state = {}) {
    super(state);
    this.loadEASDK = this.loadEASDK.bind(this);
    this.loadLCSDK = this.loadLCSDK.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
  }

  loadEASDK({ easdk = null }) {
    if (this.easdk || !easdk) return 
    this.setState({ easdk })
    this.easdk.stopLoading()
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

  saveSettings(settings) {
    if (this.loading) return console.log('ignored');
    this.easdk.startLoading();
    axios.post(`${this.url}/api/save${window.location.search}`, settings)
    .then(response => {
      this.easdk.stopLoading();
      this.setState({ settings: response.data, loading: false });
    })
    .catch(error => { 
      this.setState({loading: false});
      this.easdk.stopLoading();
    });
  }
}

const initialState = {
  app: null,
  store: null,
  shopifyKey: null,
  livechatKey: null,
  settings: {
    enabled: false,
    ...window.data.settings,
  },
  loading: false,
  error: null,
  easdk: null,
  lcsdk: null,
  ...window.data,
};

const app = new App(initialState);
export default app;