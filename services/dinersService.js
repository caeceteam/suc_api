var models = require('../models/');
var usersService = require('./usersService');
var async = require('async');
var dinersModel = models.Diner;
var usersModel = models.User;
var usersDinersModel = models.UserDiner;
dinersModel.belongsToMany(usersModel, { through: usersDinersModel, foreignKey: 'idDiner' });
usersModel.belongsToMany(dinersModel, { through: usersDinersModel, foreignKey: 'idUser' });

var getDiner = function (idDiner, responseCB) {
    var dinerResponse = { status: 200, json: {} };
    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner, err) {
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
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el diner " + idDiner }, 'status': 500 }, null);
            });
        },
        endedDinerResponse: ['findDiner', function (results, cb) {
            var user = {};
            results.findDiner.body.getUsers().then(function (users) {
                if (users.length == 1) {
                    user = users[0];
                }
                dinerResponse = {
                    diner: results.findDiner.body,
                    user: user
                };

                cb(null, { 'body': dinerResponse, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo el user para el diner " + idDiner }, 'status': 500 }, null);
            });
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
    var whereClosure = {};
    if (req.query.state) {
        var enumValue = enumsRouter.enumerations.dinerStates[req.query.state];
        whereClosure = { state: enumValue }
    }

    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        dinersCount: function (callback) {
            dinersModel.count().then(function (dinersQty) {
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
                        total_elements: results.count
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo lo diners" }, 'status': 500 }, null);
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

var createDiner = function (dinerRequest, userRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDiner: function (callback) {
            var postDiner = getDinerRequest(dinerRequest);
            postDiner.state = 0; //Se crea inactivo.
            dinersModel.create(postDiner).then(function (diner) {
                callback(null, { 'body': diner, 'status': 201 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error creando el diner" }, 'status': 500 }, null);
            });
        },
        createUser: ['createDiner', function (results, cb) {
            var createdUser;
            var postUser = usersService.getUserRequest(userRequest);
            var diner = results.createDiner.body;
            postUser.idDiner = diner.idDiner;
            usersModel.create(postUser).then(function (user) {
                diner.addUser(user);
                var result = { diner: diner, user: user };
                cb(null, { 'body': result, 'status': 201 })
            }).catch(error => {
                diner.destroy(); //Un falso rollback hasta que podamos implementar algo mejor
                cb({ 'body': { 'result': "Ha ocurrido un error creando el usuario" }, 'status': 500 }, null);
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createUser);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDiner = function (idDiner, dinerRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDiner: function (callback) {
            dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner) {
                if (diner) {
                    diner.update(dinerRequest).then(function (updatedDiner) {
                        callback(null, { 'body': updatedDiner, 'status': 202 });
                    }).catch(error => {
                        callback({ 'body': { 'result': 'No se puedo actualizar el comedor' }, 'status': 500 }, null);
                    });
                } else {
                    callback({ 'body': { 'result': 'No se puedo actualizar el comedor' }, 'status': 404 }, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDiner);
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
            getDiner(idDiner, function (err, result) {
                diner = result.body.diner;
                callback(null, diner);
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
            console.log(usersLength);
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
        callback(dinerResponse);
    });
}

var setDinerByIdAsInactive = function (idDiner, callback) {
    var dinerResponse = {};
    dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner) {
        if (diner) {
            diner.state = 0;
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
    return {
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
    }
}
module.exports = {
    getAllDiners: getAllDiners,
    getDiner: getDiner,
    createDiner: createDiner,
    updateDiner: updateDiner,
    getDinerRequest: getDinerRequest,
    deleteDiner: deleteDiner
};