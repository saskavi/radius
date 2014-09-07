var uuid = require('uuid');

var firebaseRoot = new Firebase('https://radius.firebaseio.com');

var geoFire = new GeoFire(firebaseRoot.child('locations'));

var clientID = getClientID();


function getClientID() {
  var clientID = localStorage.getItem('clientID');
  if (!clientID) {
    clientID = uuid.v4();
    localStorage.setItem('clientID', clientID);
  }
  return clientID;
}


function onPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  geoFire.set(clientID, [lat, lon]).then(function() {

    var geoPeersQuery = geoFire.query({
      center: [lat, lon],
      radius: 10000
    });

    geoPeersQuery.on("ready", function() {
      console.log("GeoQuery has loaded and fired all other events for initial data");
    });

    geoPeersQuery.on("key_entered", function(key, location, distance) {
      console.log(key + "Peer entered query at " + location + " (" + distance + " km from user)");
    });

    geoPeersQuery.on("key_exited", function(key, location, distance) {
      console.log(key + "Peer exited query to " + location + " (" + distance + " km from user)");
    });

    geoPeersQuery.on("key_moved", function(key, location, distance) {
      console.log(key + "Peer moved within query to " + location + " (" + distance + " km from user)");
    });
  }, function(err) {
    console.log("Error:", err);
    alert(err);
  });
}


//start by getting GPS position
navigator.geolocation.getCurrentPosition(onPosition);