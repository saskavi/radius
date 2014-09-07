var uuid = require('uuid');
var $ = require('jquery');

var firebase = new Firebase('https://radius.firebaseio.com');
var geoFire = new GeoFire(firebase.child('locations'));

var userID = uuid.v4(); //getUserID();
var userPosition = null; //getLastPosition();
var peersQuery = null;
var radius = 1;

//start here
$(function() {

  $("#chat").html("<p>Getting Location...</p>");

  $("#send_button").click(function() {
    console.log("btn clicked");
    sendMessage($("#message_text").val());
    $("#message_text").val("")
  });

  $("#message_text").keypress(function(e) {
    if (e.keyCode == 13) {
      sendMessage($("#message_text").val());
      $("#message_text").val("")
    }
  });

  $("#distance_slider").change(function() {
    radius = parseFloat($(this).val(), 2) / 200.0 * 9.0;
    radius = (radius * radius * radius * radius).toFixed(2);
    $("#distance_label").text(radius);
    updatePeersQuery();
  });

  navigator.geolocation.getCurrentPosition(function(position) {
    $("#chat").html("<p>Connecting...</p>");
    userPosition = [position.coords.latitude, position.coords.longitude];
    geoFire.set(userID, userPosition).then(updatePeersQuery);
  });

});


function sendMessage(msg) {
  firebase.child('users').child(userID).push(msg);
  var text = "self: " + msg;
  $("#chat").append($('<p>' + text + '</p>'));
}


function subscribeToPeer(peerID) {
  //get the other persons message stream
  if (peerID == userID)
    return;
  var peer = firebase.child('users').child(peerID);
  peer.limit(1).on("child_added", function(snapshot) {
    var text = peerID + ": " + snapshot.val();
    $("#chat").append($('<p>' + text + '</p>'));
  });
}


function unsubscribeFromPeer(peerID) {
  var peer = firebase.child('users').child(peerID);
  peer.off();
}


function updatePeersQuery() {
  if (peersQuery) peersQuery.cancel();

  peersQuery = geoFire.query({
    center: userPosition,
    radius: parseFloat(radius)
  });

  peersQuery.on("ready", function() {
    $("#chat").html("<p>Connected!</p>");
  });

  peersQuery.on("key_entered", function(key, location, radius) {
    subscribeToPeer(key);
  });

  peersQuery.on("key_exited", function(key, location, radius) {
    unsubscribeFromPeer(key);
  });

}