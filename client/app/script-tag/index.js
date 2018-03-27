import style from './styles/main.css'
import axios from 'axios'
import { URL } from '../../../config/env'

axios.get(`${URL}/api/settings?shop=${window.location.hostname}`)
.then(({ data: settings }) => {
  if (settings.enabled) {
    const hello = document.createElement('div');
    hello.innerHTML = 'Hello World!!';
    hello.classList.add(style.hello);
    document.body.prepend(hello)
    setTimeout(() => {
      hello.classList.add(style.open)
    })
  } 
})
