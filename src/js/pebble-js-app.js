Pebble.addEventListener("ready", function(event) {
  console.log("Hello world! - Sent from your javascript application.");
});


function ajax(url, type, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        callback(this.responseText);
    };
    xhr.open(type, url);
    xhr.send();
}
