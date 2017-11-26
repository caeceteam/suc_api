var models = require('../models/');
var sequelize = require('sequelize');
var _ = require('lodash');
var async = require('async');
var eventPhotosModel = models.EventPhoto;

var getEventPhoto = function (idEvent, idPhoto, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findEventPhoto: function (callback) {
            eventPhotosModel.find({ where: sequelize.and({ idEvent: idEvent }, { idPhoto: idPhoto }) }).then(function (eventPhoto, err) {
                if (err) {
                    // eventPhoto not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!eventPhoto) {
                    // incorrect eventPhoto
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': eventPhoto, 'status': 200 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el eventPhoto event " + idEvent + " photo " + idPhoto, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findEventPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllEventPhotos = function (idEvent, responseCB) {
    var whereClosure = { idEvent: idEvent };
    async.auto({
        // this function will just be passed a callback
        findAllEventPhotos: function (callback) {
            eventPhotosModel.findAll({ where: whereClosure }).then(function (eventPhotos) {
                var eventPhotoResponse = { body: { idEvent: idEvent, eventPhotos: eventPhotos }, status: 200 };
                callback(null, eventPhotoResponse)
            }).catch(error => {
                callback(error, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findAllEventPhotos);
        } else {
            responseCB(err, null);
        }
    });
}

var createEventPhoto = function (eventPhotoRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createEventPhoto: function (cb) {
            var postEventPhoto = getEventPhotoRequest(eventPhotoRequest);
            eventPhotosModel.create(postEventPhoto).then(function (eventPhoto) {
                cb(null, { 'body': eventPhoto, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el eventPhoto", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createEventPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var updateEventPhoto = function (eventPhotoRequest, responseCB) {
    var eventPhotoPUT = getEventPhotoRequest(eventPhotoRequest);
    async.auto({
        // this function will just be passed a callback
        updateEventPhoto: function (callback) {
            getEventPhoto(eventPhotoPUT.idEvent, eventPhotoPUT.idPhoto, function (err, result) {
                if (!err) {
                    var eventPhoto = result.body;
                    if (eventPhoto) {
                        eventPhoto.update(eventPhotoPUT).then(function (updatedEventPhoto) {
                            callback(null, { 'body': updatedEventPhoto, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el eventPhoto', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el eventPhoto' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateEventPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var deleteEventPhoto = function (idEvent, idPhoto, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findEventPhoto: function (callback) {
            getEventPhoto(idEvent, idPhoto, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteEventPhoto: ['findEventPhoto', function (results, cb) {
            var eventPhoto = results.findEventPhoto;
            var eventPhotoResponse = {};
            if (eventPhoto) {
                eventPhoto.destroy().then(function (result) {
                    if (result == 1) {
                        eventPhotoResponse.status = 200;
                        eventPhotoResponse.result = "Se ha borrado el eventPhoto event " + idEvent + " photo " + idPhoto;
                    } else {
                        eventPhotoResponse.status = 204;
                        eventPhotoResponse.result = "No se ha podido borrar el eventPhoto event " + idEvent + " photo " + idPhoto;
                    }
                    cb(eventPhotoResponse);
                }).catch(error => {
                    eventPhotoResponse.status = 500;
                    eventPhotoResponse.fields = error.fields                                        
                    eventPhotoResponse.result = "Error eliminando el eventPhoto event " + idEvent + " photo " + idPhoto;
                    cb(eventPhotoResponse);
                });
            } else {
                eventPhotoResponse.status = 404;
                eventPhotoResponse.result = "No se encontro el eventPhoto event " + idEvent + " photo " + idPhoto;
                cb(eventPhotoResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteEventPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var getEventPhotoRequest = function (request) {
    var eventPhotoRequest = {
        idEvent: request.idEvent,
        idPhoto: request.idPhoto,
        url: request.url
    }

    eventPhotoRequest = _.omitBy(eventPhotoRequest, _.isUndefined);
    return eventPhotoRequest;    
}

module.exports = {
    getEventPhoto: getEventPhoto,
    getAllEventPhotos: getAllEventPhotos,
    createEventPhoto: createEventPhoto,
    updateEventPhoto: updateEventPhoto,
    deleteEventPhoto: deleteEventPhoto,
    getEventPhotoRequest: getEventPhotoRequest
};