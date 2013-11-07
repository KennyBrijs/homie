exports.findOrCreateUser = function(facebookProfile_id, callback) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.usersCollection);

        collection.find({ 'facebook_id': facebookProfile_id })
            .each(function (err, docs) {
                if (err) { 
                    callback(err, docs);
                } else if (!docs) {
                    collection.insert({
                        "facebook_id": facebookProfile_id
                    }, function (err, docs) {
                        callback(err, docs);
                    });
                }
        });
    });
}


exports.getFacebookProfile = function(request, response) {
    var requestlib = require('request');

    var facebook_id = request.body.facebook_id;

    requestlib({
        uri: "https://graph.facebook.com/me",
        method: "GET"
    }, function (error, responselib, body) {
        if (responselib.statusCode != 200 || error) {
            response.send({
                "meta": utils.createErrorMeta(400, "X_003", "The Facebook API returned an error. Please try again later. " + error),
                "response": {}
            });
        } else {
            // parse the result to JSON
            var facebook_profile = JSON.parse(body);
            response.send({
                "meta": utils.createOKMeta(),
                "response": facebook_profile
            });
        }
    });
}


