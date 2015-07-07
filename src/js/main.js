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
