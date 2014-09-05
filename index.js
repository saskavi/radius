// private code //

var geofire = require("geofire");
var _ = require("lodash");

var randInt = function(x) {
    return Math.floor(Math.random() * x);
}

var randOffset = function(x) {
    return x + Math.random() * 0.000001;
}

module.exports.findNearBy = function(lat, lng, cb) {
  // TODO: Add code to actually look people up
    setTimeout(function() {
        var users = _.times(randInt(20), function(i) {
            return {
                lat: randOffset(lat),
                lng: randOffset(lng)
            };
        });

        cb(null, users);
    }, randInt(3000));
};
