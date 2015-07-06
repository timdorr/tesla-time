var apiURL = "https://owner-api.teslamotors.com",
		clientId = atob("ZTRhOTk0OWZjZmEwNDA2OGY1OWFiYjVhNjU4ZjJiYWMwYTM0MjhlNDY1MjMxNTQ5MGI2NTlkNWFiM2YzNWE5ZQ=="),
		clientSecret = atob("Yzc1ZjE0YmJhZGM4YmVlM2E3NTk0NDEyYzMxNDE2ZjgzMDAyNTZkNzY2OGVhN2U2ZTdmMDY3MjdiZmI5ZDIyMA=="),
		accessToken,
		vehicleId,
    settings;

/***
 * Events
 ***/

Pebble.addEventListener("ready", function(event) {
	settings = JSON.parse(localStorage.getItem("settings"));
	if (settings) {
		accessToken = localStorage.getItem("accessToken");
		if (!accessToken) {
			doLogin();
		} else {
			vehicleId = localStorage.getItem("vehicleId");
			if (!vehicleId) {
				getVehicle();
			} else {
				getOverview();
			}
		}
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
 * API functions
 ***/

function getState(endpoint, callback) {
	var url = "/api/1/vehicles/" + vehicleId + endpoint;

	ajax("GET", url, callback,
		function(data) {
			log(data);
			Pebble.showSimpleNotificationOnPebble("Communication Error", "Couldn't talk to Tesla servers. Check your email and password in the app settings.");
		});
}

function postCommand(endpoint, options, callback) {
	var url = "/api/1/vehicles/" + vehicleId + endpoint + "?" + queryString(options);

	ajax("POST", url, callback,
		function(data) {
			log(data);
			Pebble.showSimpleNotificationOnPebble("Communication Error", "Couldn't talk to Tesla servers. Check your email and password in the app settings.");
		});
}

function doLogin() {
	var url = "/oauth/token?" + queryString({
		grant_type: "password",
		client_id: clientId,
		client_secret: clientSecret,
		email: settings.email,
		password: settings.password
	});

	ajax("POST", url, function(response, json) {
		log("Logged in!");
		accessToken = json.access_token;
		localStorage.setItem("accessToken", accessToken);

		getVehicle();
	}, function(data) {
		log(data);
		Pebble.showSimpleNotificationOnPebble("Error Logging In", "Check your email and password in the app settings.");
	});
}

function getVehicle() {
	ajax("GET", "/api/1/vehicles", function(response, json, data) {
		// Vehicle IDs are BIGINTs, so JSON cuts off the bits. Have to scrape it out as a string.
		var matches = /"id":(\d*)/.exec(data);
		vehicleId = matches[1];
		localStorage.setItem("vehicleId", vehicleId);
		log("Got a vehicle! " + vehicleId);

		getOverview();
	}, function(data) {
		log(data);
		Pebble.showSimpleNotificationOnPebble("Error Getting Vehicle", "Check your email and password in the app settings.");
	});
}

function getOverview() {
	getState("/data_request/vehicle_state", function(response) {
		Pebble.sendAppMessage({vehicle_name: response.vehicle_name});
	});

	getState("/data_request/charge_state", function(response) {
		Pebble.sendAppMessage({rated_miles: response.battery_range});
	});
}

/***
 * Utilities
 ***/

function log(message) {
  console.log("Tesla Time - " + message);
}

function jlog(data) {
  log(JSON.stringify(data));
}

function queryString(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function ajax(method, url, callback, errorCallback) {
  log("requesting URL: " + url);

	if (callback === undefined) { callback = function(){}; }
	if (errorCallback === undefined) { errorCallback = function(){}; }

  var request = new XMLHttpRequest();
  request.open(method, apiURL + url, true);

	request.setRequestHeader("Authorization", "Bearer " + accessToken);

  request.onload = function() {
    if (request.status == 200) {
      log("success (200) with URL: " + url);
			var json = JSON.parse(request.responseText);
      callback(json.response, json, request.responseText);
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
