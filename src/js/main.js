Pebble.addEventListener("ready", function(event) {
	settings = JSON.parse(localStorage.getItem("settings"));
	if (settings) {
		accessToken = localStorage.getItem("accessToken");
		if (!accessToken) {
			doLogin();
		} else {
			vehicles = JSON.parse(localStorage.getItem("vehicles"));
			vehicleId = localStorage.getItem("vehicleId");
			if (!vehicleId) {
				getVehicle();
			} else {
				getOverview();
			}
		}
	} else {
		MessageQueue.sendAppMessage({loading_status: 1});
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
	var response = decodeURIComponent(event.response);
  log(response);

	var settings = JSON.parse(response);
	if (settings) {
		localStorage.clear();
		localStorage.setItem("settings", response);
	}
});

Pebble.addEventListener('appmessage', function(event) {
  var message = event.payload,
	   commands = {
			     "Remote Start": [
						 "remote_start_drive",
						 {password: settings.password},
						 function() {
						   Pebble.showSimpleNotificationOnPebble("Car Started", "You have 2 minutes to start driving.");
						 }],
			     "Unlock Doors": ["door_unlock"],
			       "Lock Doors": ["door_lock"],
			     "Flash Lights": ["flash_lights"],
			        "Honk Horn": ["honk_horn"],
			    "Start AC/Heat": ["auto_conditioning_start"],
			     "Stop AC/Heat": ["auto_conditioning_stop"],
			 "Open Charge Port": ["charge_port_door_open"],
			    "Stop Charging": ["charge_stop"],
			   "Start Charging": ["charge_start"]
		 };
	index = vehicles.indexOf(vehicleId);
	if (message.command && commands[message.command]) {
		postCommand.apply(this, commands[message.command]);
	} else if (vehicles.length > 1 && message.command == "Next Car") {
		newIndex = (index + 1) % vehicles.length;
		vehicleId = vehicles[newIndex];
		log("Switching to Next Car " + vehicleId + " "+ (newIndex + 1) + " of " + vehicles.length);
		localStorage.setItem("vehicleId", vehicleId);
		getOverview();
	} else if (vehicles.length > 1 && message.command == "Previous Car") {
		newIndex = ((index - 1 + vehicles.length) % vehicles.length);
		vehicleId = vehicles[newIndex];
		log("Switching to Previous Car " + vehicleId + " "+ (newIndex + 1) + " of " + vehicles.length);
		localStorage.setItem("vehicleId", vehicleId);
		getOverview();
	} else {
		log("Unknown command sent!");
		jlog(message);
	}
});
