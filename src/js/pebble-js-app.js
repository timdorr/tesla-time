var apiURL = "https://owner-api.teslamotors.com";
var settings;

/***
 * Events
 ***/

Pebble.addEventListener("ready", function(event) {
	settings = JSON.parse(localStorage.getItem("settings"));
	if (settings) {

	}
});

Pebble.addEventListener("showConfiguration", function(event) {
	if (settings) {
		log("Email already configured");
		Pebble.openURL("http://timdorr.com/tesla-time/?email=" + settings.email);
	} else {
		log("New log in");
		Pebble.openURL("http://timdorr.com/tesla-time/");
	}
});


Pebble.addEventListener("webviewclosed", function(event) {
  log(event.response);

	var settings = JSON.parse(event.response);
	if (settings) {
		localStorage.setItem("settings", event.response);
	}
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
