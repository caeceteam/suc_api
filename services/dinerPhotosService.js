var models = require('../models/');
var sequelize = require('sequelize');
var async = require('async');
var dinerPhotosModel = models.DinerPhoto;

var getDinerPhoto = function (idDiner, idPhoto, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerPhoto: function (callback) {
            dinerPhotosModel.find({ where: sequelize.and({ idDiner: idDiner }, { idPhoto: idPhoto }) }).then(function (dinerPhoto, err) {
                if (err) {
                    // dinerPhoto not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!dinerPhoto) {
                    // incorrect dinerPhoto
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': dinerPhoto, 'status': 200 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el dinerPhoto diner " + idDiner + " photo " + idPhoto }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findDinerPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllDinerPhotos = function (idDiner, responseCB) {
    var whereClosure = { idDiner: idDiner };
    async.auto({
        // this function will just be passed a callback
        findAllDinerPhotos: function (callback) {
            dinerPhotosModel.findAll({ where: whereClosure }).then(function (dinerPhotos) {
                var dinerPhotoResponse = { body: { idDiner: idDiner, dinerPhotos: dinerPhotos }, status: 200 };
                callback(null, dinerPhotoResponse)
            }).catch(error => {
                callback(error, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findAllDinerPhotos);
        } else {
            responseCB(err, null);
        }
    });
}

var createDinerPhoto = function (dinerPhotoRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDinerPhoto: function (cb) {
            var postDinerPhoto = getDinerPhotoRequest(dinerPhotoRequest);
            dinerPhotosModel.create(postDinerPhoto).then(function (dinerPhoto) {
                cb(null, { 'body': dinerPhoto, 'status': 201 });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error creando el dinerPhoto" }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createDinerPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDinerPhoto = function (dinerPhotoRequest, responseCB) {
    var dinerPhotoPUT = getDinerPhotoRequest(dinerPhotoRequest);
    async.auto({
        // this function will just be passed a callback
        updateDinerPhoto: function (callback) {
            getDinerPhoto(dinerPhotoPUT.idDiner, dinerPhotoPUT.idPhoto, function (err, result) {
                if (!err) {
                    var dinerPhoto = result.body;
                    if (dinerPhoto) {
                        dinerPhoto.update(dinerPhotoPUT).then(function (updatedDinerPhoto) {
                            callback(null, { 'body': updatedDinerPhoto, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el dinerPhoto' }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el dinerPhoto' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDinerPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var deleteDinerPhoto = function (idDiner, idPhoto, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerPhoto: function (callback) {
            getDinerPhoto(idDiner, idPhoto, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDinerPhoto: ['findDinerPhoto', function (results, cb) {
            var dinerPhoto = results.findDinerPhoto;
            var dinerPhotoResponse = {};
            if (dinerPhoto) {
                dinerPhoto.destroy().then(function (result) {
                    if (result == 1) {
                        dinerPhotoResponse.status = 200;
                        dinerPhotoResponse.result = "Se ha borrado el dinerPhoto diner " + idDiner + " photo " + idPhoto;
                    } else {
                        dinerPhotoResponse.status = 204;
                        dinerPhotoResponse.result = "No se ha podido borrar el dinerPhoto diner " + idDiner + " photo " + idPhoto;
                    }
                    cb(dinerPhotoResponse);
                }).catch(error => {
                    dinerPhotoResponse.status = 500;
                    dinerPhotoResponse.result = "Error eliminando el dinerPhoto diner " + idDiner + " photo " + idPhoto;
                    cb(dinerPhotoResponse);
                });
            } else {
                dinerPhotoResponse.status = 404;
                dinerPhotoResponse.result = "No se encontro el dinerPhoto diner " + idDiner + " photo " + idPhoto;
                cb(dinerPhotoResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDinerPhoto);
        } else {
            responseCB(err, null);
        }
    });
}

var getDinerPhotoRequest = function (request) {
    return {
        idDiner: request.idDiner,
        idPhoto: request.idPhoto,
        url: request.url
    }
}

module.exports = {
    getDinerPhoto: getDinerPhoto,
    getAllDinerPhotos: getAllDinerPhotos,
    createDinerPhoto: createDinerPhoto,
    updateDinerPhoto: updateDinerPhoto,
    deleteDinerPhoto: deleteDinerPhoto,
    getDinerPhotoRequest: getDinerPhotoRequest
};