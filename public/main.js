var uuid = require('uuid');

var firebase = new Firebase('https://radius.firebaseio.com');

var geoFire = new GeoFire(firebase.child('locations'));

var userID = getUserID();

var chatDiv = document.getElementById("chat");

var messageDiv = document.getElementById("message_text");



function getUserID() {
  var userID = localStorage.getItem('userID');
  if (!userID) {
    userID = uuid.v4();
    localStorage.setItem('userID', userID);
  }
  return userID;
}


function sendMessage() {
  //publish message in our message stream
  var msg = messageDiv.value;
  firebase.child('users').child(userID).push(msg);
  messageDiv.value = ""
}
window.sendMessage = sendMessage;


function subscribeToPeer(peerID) {
  //get the other persons message stream
  var peer = firebase.child('users').child(peerID);
  peer.limit(10).on("child_added", function(snapshot) {
    var text = peerID + ": " + snapshot.val();
    console.log('new message', text);
    var para = document.createElement('p');
    var node = document.createTextNode(text);
    para.appendChild(node);
    chatDiv.appendChild(para);

  });
}


function unsubscribeFromPeer(peerID) {
  var peer = firebase.child('users').child(peerID);
  peer.off();
}


function onPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  geoFire.set(userID, [lat, lon]).then(function() {

      var geoPeersQuery = geoFire.query({
        center: [lat, lon],
        radius: 10000
      });

      geoPeersQuery.on("ready", function() {
        console.log("GeoQuery has loaded and fired all other events for initial data");
      });

      geoPeersQuery.on("key_entered", function(key, location, distance) {
        console.log(key + "Key entered query at " + location + " (" + distance + " km from user)");
        subscribeToPeer(key);
      });

      geoPeersQuery.on("key_exited", function(key, location, distance) {
        console.log(key + "Key exited query to " + location + " (" + distance + " km from user)");
        unsubscribeFromPeer(key);
      });

      geoPeersQuery.on("key_moved", function(key, location, distance) {
        console.log(key + "Key moved within query to " + location + " (" + distance + " km from user)");
      });
    },
    function(err) {
      console.log("Error:", err);
      alert(err);
    });
}


//start by getting GPS position
navigator.geolocation.getCurrentPosition(onPosition);