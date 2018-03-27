(function() {
  function loadSettings(callback) {
    var url = 'https://493db853.ngrok.io/api/settings?shop=' + window.location.hostname;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        settings = JSON.parse(request.responseText);
        callback(settings);
      }
    }
    request.send();  
  }

  function start(settings) {
    // run the script tag logic here
    if (settings.enabled) {
      console.log('hello world enabled!')
    } else {
      console.log('hello world disabled!')
    }
  } 

  loadSettings(start) 
}())