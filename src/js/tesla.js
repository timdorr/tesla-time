var telsaApiURL = "https://owner-api.teslamotors.com",
		clientId = atob("ZTRhOTk0OWZjZmEwNDA2OGY1OWFiYjVhNjU4ZjJiYWMwYTM0MjhlNDY1MjMxNTQ5MGI2NTlkNWFiM2YzNWE5ZQ=="),
		clientSecret = atob("Yzc1ZjE0YmJhZGM4YmVlM2E3NTk0NDEyYzMxNDE2ZjgzMDAyNTZkNzY2OGVhN2U2ZTdmMDY3MjdiZmI5ZDIyMA=="),
		loadingStatus;

/* Utils */
function teslaErrorCallback(data) {
  jlog(data);
  Pebble.showSimpleNotificationOnPebble("Communication Error", "Couldn't talk to Tesla servers. Check your email and password in the app settings.");
	localStorage.removeItem("accessToken");
}

function getState(endpoint, callback) {
  reqwest({
    method: "GET",
    url: telsaApiURL + "/api/1/vehicles/" + vehicleId + endpoint,
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    type: "json",
    contentType: "application/json",
    success: function(json) {
      callback(json.response, json);
    },
    error: teslaErrorCallback
  });
}

function postCommand(endpoint, options, callback) {
	if (options === undefined) { options = {}; }
	if (callback === undefined) { callback = function(){}; }

	log(telsaApiURL + "/api/1/vehicles/" + vehicleId + "/command/" + endpoint);
	jlog(options);
  reqwest({
    method: "POST",
    url: telsaApiURL + "/api/1/vehicles/" + vehicleId + "/command/" + endpoint,
    data: options,
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    type: "json",
    success: function(json) {
      callback(json.response, json);
    },
    error: teslaErrorCallback
  });
}

/* Login */

function doLogin() {
	MessageQueue.sendAppMessage({loading_status: 2});

  reqwest({
    method: "POST",
    url: telsaApiURL + "/oauth/token",
    data: {
  		grant_type: "password",
  		client_id: clientId,
  		client_secret: clientSecret,
  		email: settings.email,
  		password: settings.password
  	},
    type: "json",
    success: function(json) {
  		log("Logged in!");
      jlog(json);
  		accessToken = json.access_token;
  		localStorage.setItem("accessToken", accessToken);

  		getVehicle();
  	},
    error: teslaErrorCallback
  });
}

/* State */

function getVehicle() {
	MessageQueue.sendAppMessage({loading_status: 3});

  reqwest({
    method: "GET",
    url: telsaApiURL + "/api/1/vehicles",
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    type: "html",
    contentType: "application/json",
    success: function(data) {
			var vehicles = [];
			var re = /"id":(\d*)/g
			var matches;
			log (data);
			// Vehicle IDs are BIGINTs, so JSON cuts off the bits. Have to scrape it out as a string.
			while ((matches = re.exec(data))!== null){
				vehicleId = matches[1];
				vehicles.push(vehicleId)
  		log("Got a vehicle! " + vehicleId);
			}
			log("Found " + vehicles.length + " vehicles");
			localStorage.setItem("vehicles", JSON.stringify(vehicles));
			localStorage.setItem("vehicleId", vehicleId);
			getOverview();
  	},
    error: teslaErrorCallback
  });
}

function getOverview() {
	MessageQueue.sendAppMessage({loading_status: 4});

  getState("/data", function(response) {
		MessageQueue.sendAppMessage({loading_status: 5});

		MessageQueue.sendAppMessage({vehicle_name: response.vehicle_state.vehicle_name});

		MessageQueue.sendAppMessage({rated_range: response.charge_state.battery_range * 100});
		MessageQueue.sendAppMessage({charging_state: response.charge_state.charging_state});

		MessageQueue.sendAppMessage({is_metric: response.gui_settings.gui_distance_units === "mi/hr" ? 0 : 1});

		reverseGeocode(response.drive_state.latitude, response.drive_state.longitude, function(json) {
      Pebble.sendAppMessage({location: json.results[0].formatted_address.substring(0,48)});
    });
	});
}
