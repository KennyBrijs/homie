// declare external files
var express = require("express");
var utils = require("./utils");
//var moment = require('moment');
var users = require("./urlroutes/users");
var rides = require("./urlroutes/rides");
var config = require("./auth/dbconfig.js");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = "172870162912122"
var FACEBOOK_APP_SECRET = "0a714caf869f889d94189a1544c5c3c5";

var config_serverAddress = "localhost:8888";


// PASSPORT

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    users.findOrCreateUser(id, function(err, user) {
        done(null, user);
    });
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: config_serverAddress + "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    users.findOrCreateUser(profile.id, function (err, user) {
        if (err) { return done(err); }
        done(null, user);
    })
  }
));



// MONGODB

/**
 * Check if there is a process.env db config (such as on Heroku) that stores the URL to the MongoDB.
 * If not, use the direct URL to a mongoDB stored in the db config.
 */
var mongourl;
if (process.env.MONGOHQ_URL) {
     mongourl = process.env.MONGOHQ_URL;
}
else {
    mongourl = config.mongourl;
}


exports.mongourl = mongourl;


// This function can be used to open a connection to the MongoDB.
// In case of a succesful connect or an error, the callback is called.
// In the first case the opened db is passed as a parameter.
function mongoConnectAndAuthenticate(callback) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(mongourl, function(err, db) {
        (db.collection(config.matchescollection)).ensureIndex( { requester_id: 1 }, function(err, idxName) { });
        (db.collection(config.matchescollection)).ensureIndex( { provider_id: 1 }, function(err, idxName) { });
        (db.collection(config.rideRequestsCollection)).ensureIndex( { start_time: 1, end_time: 1 }, function(err, idxName) { });
        (db.collection(config.rideRequestsCollection)).ensureIndex( { user_id: 1 }, function(err, idxName) { });
    });
}

exports.mongoConnectAndAuthenticate = mongoConnectAndAuthenticate;


// EXPRESS

// use express and its bodyParser for POST requests.
var app = express();
app.use(express.bodyParser());

// prevent server death in case of uncaught exceptions
process.on('uncaughtException', function (exception) {
    console.log(exception);
});


// Ride API
app.post("/rides/addriderequest", rides.addRideRequest);
app.post("rides/getriderequests", rides.getRideRequests);
app.post("/rides/acceptriderequest", rides.acceptRideRequest);
app.post("/rides/getmatchedrequest", rides.getMatchedRequests);
app.post("/rides/getmatchedrides", rides.getMatchedRides);

// User API
app.post("/users/getfacebookprofile", users.getFacebookProfile);


// Facebook auth
app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.use(express.static(__dirname + '/client'));

// start server on port 8888 OR on the port in the cloud deployment config.
console.log("Listening on port " + (process.env.PORT || 8888) +  "...");
app.listen(process.env.PORT || 8888);