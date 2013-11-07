/*
 * A ride request looks as follows:
 *
 *  {
 *      user_id:        User requesting the ride,
        start_time:     The time at which the ride request starts to be valid      (date),
        end_time:       The time at which the ride requests stops to be valid      (date),  
        destination:    The address at which the user needs to be dropped off      (string),
 *  }
 */

 /*
 * A ride match looks as follows:
 *
 *  {
 *      requester_id:   User requesting the ride,
        provider_id:    User providing the ride,       
        message:        The message written by the ride provider,
        destination:    The destination at which the requester has to be dropped off
 *  }
 */


exports.addRideRequest = function(request, response) {
    // declare external files
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var user_id = request.body.user_id;
    var start_time = new Date(request.body.start_time);
    var end_time = new Date(request.body.end_time);
    var destination = request.body.destination;

    var request = {
        "user_id": user_id,
        "start_time": start_time,
        "end_time": end_time,
        "destination": destination
    }

    function insertNewRequest(collection, request, response) {
        collection.insert(request, function (err, docs) {
            if (err) {
                response.send({
                    "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                    "response": {}
                });
            } else {
                response.send({
                    "meta": utils.createOKMeta(),
                    "response": request
                });
            }
        });
    }

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.rideRequestsCollection);

        collection.find({ 'user_id': user_id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else if (docs) {
                    collection.remove({ 'user_id': user_id }, function (err, amount_removed) {
                        insertNewRequest(collection, request, response);
                    });
                } else {
                    insertNewRequest(collection, request, response);
                }
        });
    });
}


exports.getRideRequests = function(request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var start_time = new Date(request.body.start_time);
    var end_time = new Date(request.body.end_time);

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.rideRequestsCollection);

        collection.find({ 'start_time': { $gte: start_time }, 'end_time': { $lte: end_time } })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else {
                    response.send({
                        "meta": utils.createOKMeta(),
                        "response": docs
                    });
                }
        });
    });    
}


exports.acceptRideRequest = function(request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var ride_request_id = request.body.ride_request_id;
    var provider_id = request.body.provider_id;
    var message = request.body.provider_id;

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.rideRequestsCollection);
        var matchesCollection = db.collection(config.matchesCollection);

        collection.find({ '_id': ride_request_id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else if (docs) {
                    collection.remove({ '_id': ride_request_id }, function (err, amount_removed) {
                        var match = {
                            "requester_id": docs.user_id,
                            "provider_id": provider_id,       
                            "message": message,
                            "destination": docs.destination
                        }
                        matchesCollection.insert(match, function (err, docs) {
                            if (err) {
                                response.send({
                                    "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                                    "response": {}
                                });
                            } else {
                                response.send({
                                    "meta": utils.createOKMeta(),
                                    "response": {}
                                });
                            }
                        });
                    });
                } else {
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_002", "Could not find ride request with id: " + ride_request_id),
                        "response": {}
                    });
                }
        });
    });
}


exports.getMatchedRequests = function(request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var provider_id = request.body.provider_id;

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.matchesCollection);

        collection.find({ 'provider_id': provider_id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else {
                    response.send({
                        "meta": utils.createOKMeta(),
                        "response": docs
                    });
                }
        });
    });    
}


exports.getMatchedRides = function(request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');

    var requester_id = request.body.requester_id;

    server.mongoConnectAndAuthenticate(function (err, conn, db) {
        var collection = db.collection(config.matchesCollection);

        collection.find({ 'requester_id': requester_id })
            .each(function (err, docs) {
                if (err) { 
                    response.send({
                        "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                        "response": {}
                    });
                } else {
                    response.send({
                        "meta": utils.createOKMeta(),
                        "response": docs
                    });
                }
        });
    });    
}