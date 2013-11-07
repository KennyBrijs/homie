var dbname = "Homie";
var usersCollection = "users";
var ridesRequestsCollection = "rideRequests";
var matchesCollection = "matchesCollection";

// In case of local MongoDB, use the default port for a MongoDB. Change this if your config is different.
var mongourl = "mongodb://localhost:27017";

var secret = "xxxxxxxx";

exports.dbname = dbname;
exports.usersCollection = usersCollection;
exports.ridesRequestsCollection = ridesRequestsCollection;
exports.matchesCollection = matchesCollection;
exports.mongourl = mongourl;