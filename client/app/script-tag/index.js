import style from './styles/main.css'
// import { URL } from '../../../config/env'
import socketIOClient from 'socket.io-client'
import notifyStyle from './styles/notify.css'
import $ from 'jquery'
window.$ = $;
window.jQuery = $;
const URL = "https://shopify-starter-datvt4.c9users.io";
(function() {
  const onReady = ({ enabled }) => {
    if (!enabled) return
    var socket = socketIOClient(URL);
    socket.on('connected', function(data) {
      console.log(data);
    });
    console.log(notifyStyle);
    const hello = document.createElement('div');
    hello.innerHTML = 'Hello World!!';
    hello.classList.add(style.hello);
    document.body.prepend(hello)
    setTimeout(() => {
      requestAnimationFrame(() => {
        hello.classList.add(style.open)
      })
    })
    $('body').append(`<div id="yoHolder" class="${notifyStyle.yoHolder} personalized ${notifyStyle['semi-black']}" style="display: block;">
    <div class="${notifyStyle['yo-notification']}" id="${notifyStyle['yoInnerHolder']}">
      <div class="${notifyStyle['yo-event-image']}">
        <a href="https://yo-demo.myshopify.com/products/copy-of-awesome-sneakers-for-first-time?utm_source=yo&amp;utm_medium=notification"
          class="${notifyStyle['yo-notification-url']}" style="background-image:url(https://cdn.shopify.com/s/files/1/1205/8898/products/ni313171_600_thum1_10_674_17041_c2be0ef3-380a-4c40-99c9-d4e27cb49649_medium.jpeg?v=1463579789);"
          onclick="return yoApp.queueCollect(&#39;this%20awesome%20product&#39;, &#39;click&#39;);"></a>
      </div>
      <div class="${notifyStyle['yo-notification-info']}" style="">
        <div class="${notifyStyle['yo-message']}" style="">Aidan M. from Trois-Rivières, Canada recently purchased a
          <a href="https://yo-demo.myshopify.com/products/copy-of-awesome-sneakers-for-first-time?utm_source=yo&amp;utm_medium=notification"
            style="" class="${notifyStyle['yo-notification-url']}" onclick="return yoApp.queueCollect(&#39;this%20awesome%20product&#39;, &#39;click&#39;);">
            <span style="">this awesome product </span>
          </a>
          <p class="${notifyStyle['yo-time-stamp']}" style="font-weight:normal;" datetime="2018-1-11T20:21:36Z">3 months ago</p>
        </div>
      </div>
      <span id="${notifyStyle['closeYo']}"></span>
    </div>
  </div>`);
  }

  (function loadSettings() {
    console.log("loadSettings");
    




    const src = `[src^='${URL}/assets/app/script-tag']`
    const scriptTag = document.querySelector(src)
    const query = scriptTag.getAttribute('src').split('?')[1]
    const request = new XMLHttpRequest();
    request.open('GET', `${URL}/api/settings?${query}`, true);
    request.onload = function() {
      const { status, responseText } = request
      if (status >= 200 && status < 400) {
        onReady(JSON.parse(responseText))
      }
      else {
        const error = responseText
      }
    }
    request.send()
  }())
}())
