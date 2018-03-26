(function() {
  var url = 'https://f5e2225a.ngrok.io/assets/scriptTags/test.js?shop=' + window.location.hostname;
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      window.settings = JSON.parse(request.getResponseHeader('x-settings'));
      var script = document.createElement('script');
      script.text = request.responseText;
      document.head.appendChild(script)
    }
  }

  request.send();
}())