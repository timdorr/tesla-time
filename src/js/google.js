var googleApiURL = "https://maps.googleapis.com/maps/api/",
    googleApiKey = "AIzaSyCEb5Pig6hK4Pl4kNbxEhA86p12gDWVitk";

/* Utils */

function googleAjax(method, url, params, callback, errorCallback) {
  params.key = googleApiKey;

  reqwest({
    method: method,
    url: googleApiURL + url + "/json",
    type: "json",
    contentType: "application/json",
    data: params,
    success: callback,
    error: errorCallback
  });
}

/* Geocoding */

function reverseGeocode(lat, lng, callback, errorCallback) {
  googleAjax("GET", "geocode", {latlng: lat + "," + lng}, callback, errorCallback);
}
