var uuid = require('uuid');
var $ = require('jquery');

var firebase = new Firebase('https://radius.firebaseio.com');
var geoFire = new GeoFire(firebase.child('locations'));

var userID = getUserID();
var userPosition = null;
var peersQuery = null;
var radius = 1;

//start here
$(function() {

  $("#send_button").click(function() {
    console.log("btn clicked");
    sendMessage($("#message_text").val());
    $("#message_text").val("")
  });

  $("#distance_slider").change(function() {
    console.log("distance changed", $("#distance_slider").val());
    ds = $(this);
    radius = parseFloat(ds.val(), 2) / 200.0 * 9.0;
    radius = (radius * radius * radius * radius).toFixed(2);
    $("#distance_label").text(radius);
    updatePeersQuery();
  });

  //start by getting GPS position
  navigator.geolocation.getCurrentPosition(function(position) {
    userPosition = [position.coords.latitude, position.coords.longitude];
    geoFire.set(userID, userPosition).then(updatePeersQuery);
  });

});


function sendMessage(msg) {
  firebase.child('users').child(userID).push(msg);
}


function subscribeToPeer(peerID) {
  //get the other persons message stream
  var peer = firebase.child('users').child(peerID);
  peer.limit(10).on("child_added", function(snapshot) {
    var text = peerID + ": " + snapshot.val();
    console.log('new message', text);
    $("#chat").append($('<p>' + text + '</p>'));
  });
}


function unsubscribeFromPeer(peerID) {
  var peer = firebase.child('users').child(peerID);
  peer.off();
}


function updatePeersQuery() {
  if (peersQuery) peersQuery.cancel();

  if (!userPosition) return;

  peersQuery = geoFire.query({
    center: userPosition,
    radius: parseFloat(radius)
  });

  peersQuery.on("ready", function() {
    console.log("GeoQuery has loaded and fired all other events for initial data");
  });

  peersQuery.on("key_entered", function(key, location, radius) {
    subscribeToPeer(key);
    console.log(key + "user entered " + distance + " km from here(" + key + ")");
  });

  peersQuery.on("key_exited", function(key, location, radius) {
    unsubscribeFromPeer(key);
    console.log(key + "user exited " + distance + " km from here(" + key + ")");
  });

  peersQuery.on("key_moved", function(key, location, radius) {
    console.log(key + "user moved " + distance + " km from here(" + key + ")");
  });
}


function getUserID() {
  var userID = localStorage.getItem('userID');
  if (!userID) {
    userID = uuid.v4();
    localStorage.setItem('userID', userID);
  }
  return userID;
}