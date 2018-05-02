import State from 'tynker-state'
import axios from 'axios'

class App extends State {

  /* @desc construct the state and bind any functions
   * that are going to be passed to DOM elements
  */
  constructor(state = {}) {
    super(state)
    this.loadEASDK = this.loadEASDK.bind(this)
    this.loadLCSDK = this.loadLCSDK.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.createCharge = this.createCharge.bind(this)
    this.dismissStatus = this.dismissStatus.bind(this)
  }

  /* @param {DOM Element} comp - EASDK React Component
   * @param {object} comp.easdk - The EASDK API
   * @desc sets the easdk to state
  */
  loadEASDK({ easdk = null }) {
    if (this.state.easdk || !easdk) return 
    this.setState({ easdk })
    this.state.easdk.stopLoading()
  }

  /* @param {object} lcsdk: The LiveChat SDK
   * @desc sets the lcsdk to state once it's loaded properly
   * note: lcsdk has a bug. it passes lcsdk object before underlying functions are ready
   * a times is used to check required functions, when they're ready we save the lcsdk to state
  */
  loadLCSDK(lcsdk) {
    if (this.state.lcsdk || !lcsdk) return
    const timer = setInterval(() => {
      if (window.LC_Invite && window.LC_API) {
        const data = [
          { name: 'app', value: this.app },
          { name: 'store', value: this.store }
        ]
        clearInterval(timer)
        this.setState({ lcsdk })
        this.state.lcsdk.set_custom_variables(data)
      }
    }, 200)
  }

  /* @param {object} settings: 
   * @desc save the settings to the server, once confirmation
   * that the save was succesfull, update the local state settings
  */
  saveSettings(settings) {
    if (this.state.loading) return
    this.state.easdk.startLoading()
    axios.post(`/api/settings${window.location.search}`, settings)
    .then(response => {
      this.state.easdk.stopLoading()
      this.setState({ settings: response.data, loading: false })
    })
    .catch(error => { 
      this.setState({loading: false})
      this.state.easdk.stopLoading()
    })
  }

  /* @desc gets then redirects the user to charge confirmation page
  */
  createCharge() {
    console.log('createCharge');
    this.setState({loading: true})
    axios.get(`/billing/confirm${window.location.search}`)
    .then(({ data: { confirmation_url } }) => {
      this.setState({loading: false})
      this.state.easdk.redirect(confirmation_url)
    })
    .catch(error => this.setState({loading: false}))
  }

  /* @desc gets then redirects the user to charge confirmation page
  */
  dismissStatus() {
    this.setState({ statusDismissed: true })
  }
}

const initialData = Object.assign({}, {
  app: null,
  isActive: true,
  liveChatKey: null,
  shopifyKey: null,
  store: '',
  trialDays: 0,
  prepaidDays: 0,
  settings: {
    enabled: false,
    ...window.data.settings
  }
}, window.data)
console.log(initialData);
const app = new App(initialData)
export default app