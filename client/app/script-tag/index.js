import style from './styles/main.css'
import { URL } from '../../../config/env'

(function() {
  const onReady = ({ enabled }) => {
    if (!enabled) return

    const hello = document.createElement('div');
    hello.innerHTML = 'Hello World!!';
    hello.classList.add(style.hello);
   
    document.body.prepend(hello)
    setTimeout(() => {
      requestAnimationFrame(() => {
        hello.classList.add(style.open)
      })
    })
  }

  (function loadSettings() {
    const src = `[src^='${URL}/assets/app/script-tag']`
    const scriptTag = document.querySelector(src)
    const query = scriptTag.getAttribute('src').split('?')[1]
    const request = new XMLHttpRequest();
    request.open('GET', `${URL}/api/settings?${query}`, true);
    request.onload = function() {
      const { status, responseText } = request
      if (status >= 200 && status < 400) {
        onReady(JSON.parse(responseText))
      } else {
        const error = responseText
      }
    }
    request.send()
  }())
}())
