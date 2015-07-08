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

Pebble.addEventListener('appmessage', function(event) {
  var message = event.payload,
	   commands = {
			     "Remote Start": [
						 "remote_start_drive",
						 {password: settings.password},
						 function() {
						   Pebble.showSimpleNotificationOnPebble("Car Started", "You have 2 minutes to start driving.");
						 }],
			       "Lock Doors": ["door_lock"],
			     "Unlock Doors": ["door_unlock"],
			     "Flash Lights": ["flash_lights"],
			        "Honk Horn": ["honk_horn"],
			    "Start AC/Heat": ["auto_conditioning_start"],
			     "Stop AC/Heat": ["auto_conditioning_stop"],
			 "Open Charge Port": ["charge_port_door_open"],
			    "Stop Charging": ["charge_stop"],
			   "Start Charging": ["charge_start"]
		 };

	if (message.command && commands[message.command]) {
		postCommand.apply(this, commands[message.command]);
	} else {
		log("Unknown command sent!");
		jlog(message);
	}
});
