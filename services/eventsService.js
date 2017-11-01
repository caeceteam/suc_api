var models = require('../models/');
var sequelize = require('sequelize');
var _ = require('lodash');
var queryHelper = require('../helpers/queryHelper');
var usersService = require('./usersService');
var async = require('async');
var eventsModel = models.Event;
var eventsPhotoModel = models.EventPhoto;
eventsModel.hasMany(eventsPhotoModel, { as: 'photos', foreignKey: 'idEvent' });

var getEvent = function (idEvent, responseCB) {
    var eventResponse = { status: 200, json: {} };
    async.auto({
        // this function will just be passed a callback
        findEvent: function (callback) {
            eventsModel.find({ where: { idEvent: idEvent }, include:[{model:eventsPhotoModel, as: 'photos'}] }).then(function (event, err) {
                if (err) {
                    // diner not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!event) {
                    // incorrect diner
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': event, 'status': 200 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el evento " + idEvent, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findEvent);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllEvents = function (idDiner, req, responseCB) {
    var whereClosure = sequelize.and ( queryHelper.buildQuery("Event",req.query) ) ;

    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        eventsCount: function (callback) {
            eventsModel.count({ where: whereClosure }).then(function (eventsQty) {
                callback(null, eventsQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['eventsCount', function (results, cb) {
            eventsModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (eventsCol) {
                var total_pages = Math.ceil(results.eventsCount / page_size);
                var number_of_elements = eventsCol.length;
                var result = {
                    events: eventsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.eventsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los eventos", 'fields': error.fields }, 'status': 500 }, null);
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.paginate);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllEventsWithGeo = function (req, responseCB) {
    async.auto({
        // this function will just be passed a callback
        buildQuery: function (callback) {
            try{
                var lat = parseFloat(req.query.latitude);
                var lng = parseFloat(req.query.longitude);
                var maxDistance = req.query.maxDistance || req.query.max_distance || 10;
                var maxResults = req.query.maxResults || req.query.max_results || 10;
                var attributes = Object.keys(models.Event.attributes);
                var location = sequelize.literal(`ST_GeomFromText('POINT(${lat} ${lng})')`);
                var distance = sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))",'distance');
                attributes.push([distance,'distance']);
            
                var query = {
                    attributes: attributes,
                    order: sequelize.col('distance'),
                    where: sequelize.where(distance, {$lte: maxDistance}),
                  limit: Math.ceil(maxDistance),
                  logging: console.log
                }

                callback(null, query);
            }catch(ex){
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo los events"}, 'status': 500 })
            }
        },
        findAll: ['buildQuery', function (results, cb) {
            eventsModel.findAll(results.buildQuery).then(function(events){
                cb(null, { 'body': { 'events': events}, 'status': 200 });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los events"}, 'status': 500 })                
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findAll);
        } else {
            responseCB(err, null);
        }
    });
}

var createEvent = function (eventRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createEvent: function (callback) {
            var postEvent = getEventRequest(eventRequest);
            eventsModel.create(postEvent).then(function (event) {
                var insertPhotosPromises = [];                
                for (var photo in postEvent.photos) {
                    var url = postEvent.photos[photo];
                    var postPhoto = {url: url, idEvent: event.idEvent};
                    insertPhotosPromises.push(models.EventPhoto.create(postPhoto));                    
                }
                Promise.all(insertPhotosPromises).then(function(values){
                    var eventJson = event.toJSON()
                    console.log(values);
                    eventJson.photos = values;
                    callback(null, { 'body': eventJson, 'status': 201 });
                });                
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error creando el event", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createEvent);
        } else {
            responseCB(err, null);
        }
    });
}

var updateEvent = function (idEvent, eventRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateEvent: function (callback) {
            getEvent(idEvent, function (err, result) {
                if (!err) {
                    var event = result.body;
                    if (event) {
                        var putEvent = getEventRequest(eventRequest);
                        event.update(putEvent).then(function (updatedEvent) {
                            var upsertPhotosPromises = [];
                            for (var photo in putEvent.photos) {
                                var putPhoto = putEvent.photos[photo];
                                putPhoto.idEvent = event.idEvent;
                                upsertPhotosPromises.push(models.EventPhoto.upsert(putPhoto));
                            }
                            Promise.all(upsertPhotosPromises).then(values => console.log(values));
                            callback(null, { 'body': updatedEvent, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el evento', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el evento' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateEvent);
        } else {
            responseCB(err, null);
        }
    });
}

var deleteEvent = function (idEvent, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findEvent: function (callback) {
            getEvent(idEvent, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteEvent: ['findEvent', function (results, cb) {
            var event = results.findEvent;
            var eventResponse = {};
            if (event) {
                event.destroy().then(function (result) {
                    if (result == 1) {
                        eventResponse.status = 200;
                        eventResponse.result = "Se ha borrado el evento " + idEvent;
                    } else {
                        eventResponse.status = 204;
                        eventResponse.result = "No se ha podido borrar el evento " + idEvent;
                    }
                    cb(eventResponse);
                }).catch(error => {
                    eventResponse.status = 500;
                    eventResponse.result = "Error eliminando el evento " + idEvent;
                    eventResponse.fields = error.fields                    
                    cb(eventResponse);
                });
            } else {
                eventResponse.status = 404;
                eventResponse.result = "No se encontro el evento " + idEvent;
                cb(eventResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteEvent);
        } else {
            responseCB(err, null);
        }
    });
}

var getEventRequest = function (eventRequest) {
    var eventRequest = {
        name: eventRequest.name,
        street: eventRequest.street,
        streetNumber: eventRequest.streetNumber,
        floor: eventRequest.floor,
        door: eventRequest.door,
        latitude: eventRequest.latitude,
        longitude: eventRequest.longitude,
        zipCode: eventRequest.zipCode,
        phone: eventRequest.phone,
        description: eventRequest.description,
        link: eventRequest.link,
        date: eventRequest.date,
        idDiner: eventRequest.idDiner,
        photos: eventRequest.photos
    }

    eventRequest = _.omitBy(eventRequest, _.isUndefined);
    return eventRequest;    
}
module.exports = {
    getEventRequest: getEventRequest,
    getEvent: getEvent,
    getAllEvents: getAllEvents,
    getAllEventsWithGeo: getAllEventsWithGeo,
    createEvent: createEvent,
    updateEvent: updateEvent,
    deleteEvent: deleteEvent
};