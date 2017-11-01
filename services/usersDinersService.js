var models = require('../models/');
var sequelize = require('sequelize');
var _ = require('lodash');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var usersModel = models.User;
var userDinerModel = models.UserDiner;
userDinerModel.belongsTo(usersModel, { as: 'user', foreignKey: 'idUser' });

var getUsersDiners = function (req, responseCB) {
    var whereClosure = sequelize.and ( queryHelper.buildQuery("UserDiner",req.query) ) ;
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        usersDinersCount: function (callback) {
            userDinerModel.count({where: whereClosure}).then(function (userDinerQty) {
                callback(null, userDinerQty)
            }).catch(error => {
                console.log(error);
                callback(error, null);
            });
        },
        paginate: ['usersDinersCount', function (results, cb) {
            userDinerModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure , include:[{model: usersModel, as: 'user'}]}).then(function (usersDinersCol) {
                var total_pages = Math.ceil(results.usersDinersCount / page_size);
                var number_of_elements = usersDinersCol.length;
                var result = {
                    usersDiners: usersDinersCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.usersDinersCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                console.log(error);                
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los userDiner", 'fields': error.fields }, 'status': 500 }, null);
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

var createUserDiner = function (userDinerRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createUserDiner: function (cb) {
            var postUserDiner = getUserDinerRequest(userDinerRequest);
            userDinerModel.create(postUserDiner).then(function (userDiner) {
                cb(null, { 'body': userDiner, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el userDiner", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createUserDiner);
        } else {
            responseCB(err, null);
        }
    });
}

var updateUserDiner = function (userDinerRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateUserDiner: function (callback) {
            var putUserDiner = getUserDinerRequest(userDinerRequest);
            userDinerModel.upsert(putUserDiner).then(function (userDiner) {
                callback(null, { 'body': userDinerRequest, 'status': 202 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error actualizando el userDiner", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateUserDiner);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteUserDiner = function (idDiner,idUser, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findUserDiner: function (callback) {
            userDinerModel.find({where:{idDiner: idDiner, idUser:idUser}}).then(function(userDiner){
                if(!userDiner){
                    callback({ 'body': { 'result': "No se ha encontrado el userDinerr"}, 'status': 404 }, null);
                }

                callback(null, userDiner)
            });
        },
        deleteUserDiner: ['findUserDiner', function (results, cb) {
            var userDiner = results.findUserDiner;
            var userDinerResponse = {};
            if (userDiner) {
                userDiner.destroy().then(function (result) {
                    if (result == 1) {
                        userDinerResponse.status = 200;
                        userDinerResponse.result = "Se ha borrado el userDiner idUser: " + userDiner.idUser + "idDiner: " + userDiner.idDiner;
                    } else {
                        userDinerResponse.status = 204;
                        userDinerResponse.result = "No se ha podido borrar el userDiner idUser: " + userDiner.idUser + "idDiner: " + userDiner.idDiner
                    }
                    cb(userDinerResponse);
                }).catch(error => {
                    userDinerResponse.status = 500;
                    userDinerResponse.result = "Error eliminando el userDiner idUser: " + userDiner.idUser + "idDiner: " + userDiner.idDiner;
                    userDinerResponse.fields = error.fields                    
                    cb(userDinerResponse);
                });
            } else {
                userDinerResponse.status = 404;
                userDinerResponse.result = "No se encontro el userDiner idUser: " + userDiner.idUser + "idDiner: " + userDiner.idDiner;
                cb(userDinerResponse);
            }

        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteUserDiner);
        } else {
            responseCB(err, null);
        }
    });
}

var getUserDinerRequest = function (request) {
    var userDinerRequest = {
        idUser: request.idUser,
        idDiner: request.idDiner,
        active: request.active,
        isCollaborator: request.isCollaborator
    };

    userDinerRequest = _.omitBy(userDinerRequest, _.isUndefined);
    return userDinerRequest;    
};


module.exports = {
    getUserDinerRequest: getUserDinerRequest,
    getUsersDiners: getUsersDiners,
    createUserDiner: createUserDiner,
    updateUserDiner: updateUserDiner,
    deleteUserDiner: deleteUserDiner
};