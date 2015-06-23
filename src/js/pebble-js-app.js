var apiURL = "https://owner-api.teslamotors.com";

/***
 * Events
 ***/

Pebble.addEventListener("ready", function(event) {});

Pebble.addEventListener("showConfiguration", function(event) {
	Pebble.openURL("http://timdorr.com/tesla-time/");
});


Pebble.addEventListener("webviewclosed", function(event) {
  log(event.response);
});

/***
 * Utilities
 ***/

function log(message) {
  console.log("Tesla Time - " + message);
}

function ajax(method, url, callback, errorCallback) {
  log("requesting URL: " + url);

  var request = new XMLHttpRequest();
  request.open(method, apiURL + url, true);

  request.onload = function() {
    if (request.status == 200) {
      log("success (200) with URL: " + url);
      callback(request.responseText);
    } else {
      log("error (" + request.status + ") with URL: " + url);
      errorCallback(request.responseText);
    }
  };
  request.onerror = function() {
    log("XHR onerror with URL: " + url);
    errorCallback(request.responseText);
  };

  request.send();
}
