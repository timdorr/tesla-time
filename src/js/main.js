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
  var message = event.payload;

	if (message.command) {
		switch (message.command) {
			case "Remote Start":
				postCommand("remote_start_drive", {password: settings.password}, function() {
					Pebble.showSimpleNotificationOnPebble("Car Started", "You have 2 minutes to start driving.");
				});
				break;
			case "Lock Doors":
				postCommand("door_lock", {}, function() {});
				break;
			case "Unlock Doors":
				postCommand("door_unlock", {}, function() {});
				break;
			case "Flash Lights":
				postCommand("flash_lights", {}, function() {});
				break;
			case "Honk Horn":
				postCommand("honk_horn", {}, function() {});
				break;
			case "Start AC/Heat":
				postCommand("auto_conditioning_start", {}, function() {});
				break;
			case "Stop AC/Heat":
				postCommand("auto_conditioning_stop", {}, function() {});
				break;
			case "Open Charge Port":
				postCommand("charge_port_door_open", {}, function() {});
				break;
			case "Stop Charging":
				postCommand("charge_stop", {}, function() {});
				break;
			case "Start Charging":
				postCommand("charge_start", {}, function() {});
				break;
			default:
				log("Unknown command sent!");
				jlog(message);
		}
	}
});
