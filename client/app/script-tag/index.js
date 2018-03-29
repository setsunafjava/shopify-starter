import axios from 'axios'
import style from './styles/main.css'
import { URL } from '../../../config/env'

axios.get(`${URL}/api/settings?shop=${window.location.hostname}`)
.then(({ data: settings }) => {
  if (settings.enabled) {
    const hello = document.createElement('div');
    hello.innerHTML = 'Hello World!!';
    hello.classList.add(style.hello);
    if (settings.color) {
      hello.classList.add(style.color);
    }
    document.body.prepend(hello)
    setTimeout(() => {
      requestAnimationFrame(() => {
        hello.classList.add(style.open)
      })
    })
  } 
})