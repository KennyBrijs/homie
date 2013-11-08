/*
 * A user looks as follows:
 *
 *  {
 *      facebook_id:  The user's Facebook id
 *  }
 */

exports.loginFacebookUser = function(request, response) {
    var requestlib = require('request');
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var facebookProfile = request.body.facebook_profile;

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.usersCollection);

        collection.find({ 'facebook_id': facebookProfile.id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else if (!docs) {
                    collection.insert({
                        "facebook_id": facebookProfile.id
                    }, function (err, docs) {
                        if (err) {
                            response.send({
                                "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                                "response": {}
                            });
                        } else {
                            response.send({
                                "meta": utils.createOKMeta(),
                                "response": docs._id;
                            });
                        }
                    });
                } else {
                    response.send({
                        "meta": utils.createOKMeta(),
                        "response": docs._id;
                    });
                }
        });
    });
}


exports.getHomieIdForFacebookId = function(request, response) {
    var requestlib = require('request');

    var facebook_id = request.body.facebook_id;
    
    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.usersCollection);

        collection.find({ 'facebook_id': facebook_id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else if (!docs) {
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_004", "User with Facebook id not found: " + facebook_id),
                        "response": {}
                    });
                } else {
                    response.send({
                        "meta": utils.createOKMeta(),
                        "response": docs._id;
                    });
                }
        });
    });   
}


