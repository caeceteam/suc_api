var sequelize = require('sequelize');
var _ = require('lodash');
var queryHelper = require('../helpers/queryHelper');
var models = require('../models/');
var usersService = require('./usersService');
var dinerPhotosService = require('./dinerPhotosService');
var enumerations = require('../enums/enumerations');
var async = require('async');
var dinersModel = models.Diner;
var usersModel = models.User;
var usersDinersModel = models.UserDiner;
var dinersPhotoModel = models.DinerPhoto;
var dinerRequestsModel = models.DinerRequest;
dinersModel.belongsToMany(usersModel, { through: usersDinersModel, foreignKey: 'idDiner', as:'users' });
usersModel.belongsToMany(dinersModel, { through: usersDinersModel, foreignKey: 'idUser', as:'users' });
dinersModel.hasMany(dinersPhotoModel, { as: 'photos', foreignKey: 'idDiner' });
dinersModel.hasMany(dinerRequestsModel, { as: 'requests', foreignKey: 'idDiner' });

var getDiner = function (idDiner, responseCB) {
    var dinerResponse = { status: 200, json: {} };
    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersModel.find({ where: { idDiner: idDiner }, include: 
                [{ model: dinerRequestsModel, as: 'requests' },
                { model: dinersPhotoModel, as: 'photos' },
                { model: usersModel, as: 'users'}]
             }).then(function (diner, err) {
                if (err) {
                    // diner not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!diner) {
                    // incorrect diner
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': diner, 'status': 200 });
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el diner " + idDiner, 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        endedDinerResponse: ['findDiner', function (results, cb) {
            var user = {};
            var dinerResponse = results.findDiner.body.toJSON();
            var users = results.findDiner.body.users;
            console.log(users.length);
            dinerResponse.user = {};
            if (users.length == 1) {
                user = users[0];
                user = user.toJSON();
                user.active = user.UserDiner.active;
                dinerResponse.user = user;
            }
            dinerResponse.users = undefined;
            cb(null, { 'body': dinerResponse, 'status': 200 })
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.endedDinerResponse);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllDiners = function (req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("Diner", req.query));
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;
    async.auto({
        // this function will just be passed a callback
        dinersCount: function (callback) {
            dinersModel.count({ where: whereClosure }).then(function (dinersQty) {
                callback(null, dinersQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['dinersCount', function (results, cb) {
            dinersModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (dinersCol) {
                var total_pages = Math.ceil(results.dinersCount / page_size);
                var number_of_elements = dinersCol.length;
                var result = {
                    diners: dinersCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.dinersCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los diners", 'fields': error.fields }, 'status': 500 }, null);
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

var getAllDinersWithGeo = function (req, responseCB) {
    async.auto({
        // this function will just be passed a callback
        buildQuery: function (callback) {
            try{
                var lat = parseFloat(req.query.latitude);
                var lng = parseFloat(req.query.longitude);
                var maxDistance = req.query.maxDistance || req.query.max_distance || 10;
                var maxResults = req.query.maxResults || req.query.max_results || 10;
                var attributes = Object.keys(models.Diner.attributes);
                var location = sequelize.literal(`ST_GeomFromText('POINT(${lat} ${lng})')`);
                var distance = sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))",'distance');
                attributes.push([distance,'distance']);
            
                var query = {
                    attributes: attributes,
                    order: sequelize.col('distance'),
                    where: sequelize.where(distance, {$lte: maxDistance}),
                  limit: Math.ceil(maxDistance),
                  logging: console.log,
                  include:[
                    { model: dinerRequestsModel, as: 'requests' }
                  ]
                }

                callback(null, query);
            }catch(ex){
                console.log(ex);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo los diners"}, 'status': 500 })
            }
        },
        findAll: ['buildQuery', function (results, cb) {
            dinersModel.findAll(results.buildQuery).then(function(diners){
                cb(null, { 'body': { 'diners': diners}, 'status': 200 });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los diners"}, 'status': 500 })                
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

var createDiner = function (dinerRequest, userRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDiner: function (callback) {
            var postDiner = getDinerRequest(dinerRequest);
            postDiner.state = 0; //Se crea inactivo.
            dinersModel.create(postDiner).then(function (diner) {
                callback(null, { 'body': diner, 'status': 201 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error creando el diner", 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        createPhotos: ['createDiner', function (results, cb) {
            var diner = results.createDiner.body;
            var postDiner = getDinerRequest(dinerRequest);
            if (postDiner.photos && postDiner.photos.length > 0) {
                var insertPhotosPromises = [];
                for (var photo in postDiner.photos) {
                    var url = postDiner.photos[photo];
                    var postPhoto = { url: url, idDiner: diner.idDiner };
                    insertPhotosPromises.push(models.DinerPhoto.create(postPhoto));
                }
                Promise.all(insertPhotosPromises).then(function (values) {
                    cb(null, { 'body': values, 'status': 201 });
                }).catch(error => {
                    cb({ 'body': { 'result': "Ha ocurrido un error creando las photos", 'fields': error.fields }, 'status': 500 }, null);
                });;
            } else {
                cb(null, { 'body': {}, 'status': 204 })
            }
        }],
        createUser: ['createDiner', function (results, cb) {
            var createdUser;
            var postUser = usersService.getUserRequest(userRequest, true);
            var diner = results.createDiner.body;
            postUser.idDiner = diner.idDiner;
            usersModel.create(postUser).then(function (user) {
                user.DinerUser = { active: postUser.active };
                diner.addUser(user);
                var result = { diner: diner, user: user };
                cb(null, { 'body': result, 'status': 201 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el usuario", 'fields': error.fields }, 'status': 500 }, null);
            });
        }],
        endDinerCreation: ['createPhotos', 'createUser', function (results, cb) {
            try {
                var dinerJson = results.createUser.body.diner.toJSON();
                var user = results.createUser.body.user;
                var photos = results.createPhotos.body;
                dinerJson.photos = photos;
                var dinerResponse = {
                    diner: dinerJson,
                    user: user
                };
                cb(null, { 'body': dinerResponse, 'status': 201 })
            } catch (ex) {
                console.log("Algo se rompio en la creacion del comedor stack:" + ex);
            }

        }],
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.endDinerCreation);
        } else {
            if(results.createDiner != undefined && results.createDiner.body != undefined){
                results.createDiner.body.destroy();
            }
            responseCB(err, null);
        }
    });
}

var updateDiner = function (idDiner, requests, responseCB) {
    var dinerRequest = requests.diner;
    var userRequest = requests.user;
    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersModel.find({where: {idDiner: idDiner}}).then(function(diner){
                callback(null, diner);
            }).catch( error => {
                console.log(error);
                callback({ 'body': { 'result': 'No se puedo actualizar el comedor' }, 'status': 404 }, null);
            });
        },
        findUser: function (callback) {
            if (!_.isEmpty(userRequest)) {
                usersService.getUser(userRequest.mail, function (err, result) {
                    if (!err) {
                        callback(null, result.body.user);
                    } else {
                        callback(err, null);
                    }
                });
            } else {
                callback(null, undefined);
            }
        },
        updateDiner: ['findDiner', function (results, callback) {
            var diner = results.findDiner;
            if (diner) {
                diner.update(getDinerRequest(dinerRequest)).then(function (updatedDiner) {
                    callback(null, updatedDiner);
                }).catch(error => {
                    console.log(error);
                    callback({ 'body': { 'result': 'No se puedo actualizar el comedor', 'fields': error.fields }, 'status': 500 }, null);
                });
            } else {
                callback({ 'body': { 'result': 'No se puedo actualizar el comedor' }, 'status': 404 }, null);
            }
        }],
        updateUser: ['findUser', function (results, callback) {
            var user = results.findUser;
            if (user != undefined) {
                console.log("Aca no");
                usersService.updateUser(userRequest.mail, userRequest, function (err, result) {
                    var updatedUser = result.body;
                    if (user) {
                        usersDinersModel.upsert({ idUser: updatedUser.idUser, idDiner: idDiner, active: userRequest.active });
                        var jsonUpdatedUser = updatedUser.toJSON();
                        jsonUpdatedUser.active = userRequest.active;
                        callback(null, jsonUpdatedUser);
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el usuario' }, 'status': 404 }, null);
                    }
                });
            } else {
                callback(null, {});
            }
        }],
        updatePhotos: ['findDiner', function (results, callback) {
            var diner = results.findDiner;
            var upsertPhotosPromises = [];
            var photos = [];
            if (diner) {
                for (var photo in dinerRequest.photos) {
                    var putPhoto = dinerRequest.photos[photo];
                    putPhoto.idDiner = diner.idDiner;
                    photos.push(putPhoto);
                    upsertPhotosPromises.push(models.DinerPhoto.upsert(putPhoto));
                }
                Promise.all(upsertPhotosPromises).then(values => {
                    callback(null, photos);
                });
            }
        }]
    }, function (err, results) {
        if (!err) {
            var dinerResponse = results.updateDiner.toJSON();
            dinerResponse.photos = results.updatePhotos;
            responseCB(null, { "body": { diner: dinerResponse, user: results.updateUser }, "status": 202 });
        } else {
            responseCB(err, null);
        }
    });

}

var deleteDiner = function (idDiner, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            var diner;
            dinersModel.find({where: {idDiner: idDiner}}).then(function(diner){
                callback(null, diner);
            }).catch( error => {
                callback({ 'body': { 'result': 'No se puedo actualizar el comedor' }, 'status': 404 }, null);
            });
        },
        countUsers: ['findDiner', function (results, callback) {
            var diner = results.findDiner;
            try {
                diner.getUsers().then(function (users) {
                    callback(null, { 'body': users.length, 'status': 200 });
                });
            } catch (error) {
                callback(error, null)
            };
        }],
        processDiner: ['countUsers', function (results, cb) {
            var usersLength = results.countUsers.body;
            if (usersLength == 0) {
                deleteDinerById(idDiner, function (result) {
                    cb(null, { 'body': result.result, 'status': result.status });
                });
            } else {
                setDinerByIdAsInactive(idDiner, function (result) {
                    cb(null, { 'body': result.result, 'status': result.status });
                });
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.processDiner);
        } else {
            responseCB(err, null);
        }
    });
}

var deleteDinerById = function (idDiner, callback) {
    var dinerResponse = {};
    dinersModel.destroy({ where: { idDiner: idDiner } }).then(function (result) {
        if (result == 1) {
            dinerResponse.status = 200;
            dinerResponse.result = "Se ha borrado el comedor " + idDiner;
        } else {
            dinerResponse.status = 204;
            dinerResponse.result = "No se ha podido borrar el comedor " + idDiner;
        }
        callback(dinerResponse);
    }).catch(error => {
        dinerResponse.status = 500;
        dinerResponse.result = "Error eliminando el comedor " + idDiner;
        dinerResponse.fields = error.fields
        callback(dinerResponse);
    });
}

var setDinerByIdAsInactive = function (idDiner, callback) {
    var dinerResponse = {};
    dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner) {
        if (diner) {
            diner.state = -1;
            diner.save();
            dinerResponse.status = 202;
            dinerResponse.result = diner;
        } else {
            dinerResponse.status = 404;
            dinerResponse.result = "No se encontro el comedor " + idDiner;
        }
        callback(dinerResponse);
    });
}

var getDinerRequest = function (dinerRequest) {
    var dinerRequest = {
        name: dinerRequest.name,
        state: dinerRequest.state,
        street: dinerRequest.street,
        streetNumber: dinerRequest.streetNumber,
        floor: dinerRequest.floor,
        door: dinerRequest.door,
        latitude: dinerRequest.latitude,
        longitude: dinerRequest.longitude,
        zipCode: dinerRequest.zipCode,
        phone: dinerRequest.phone,
        description: dinerRequest.description,
        link: dinerRequest.link,
        mail: dinerRequest.mail,
        photos: dinerRequest.photos
    }

    dinerRequest = _.omitBy(dinerRequest, _.isUndefined);
    return dinerRequest;    
}
module.exports = {
    getAllDiners: getAllDiners,
    getAllDinersWithGeo: getAllDinersWithGeo,
    getDiner: getDiner,
    createDiner: createDiner,
    updateDiner: updateDiner,
    getDinerRequest: getDinerRequest,
    deleteDiner: deleteDiner
};