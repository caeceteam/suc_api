const crypto = require('crypto');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var models = require('../models/');
var _ = require('lodash');
var dinersModel = models.Diner;
var usersModel = models.User;
var usersDinersModel = models.UserDiner;
dinersModel.belongsToMany(usersModel, { through: usersDinersModel, foreignKey: 'idDiner' });
usersModel.belongsToMany(dinersModel, { through: usersDinersModel, foreignKey: 'idUser' });


var getUser = function (searchParam, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findUser: function (callback) {
            usersModel.find({ where: sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (user, err) {
                if (err) {
                    // user not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!user) {
                    // incorrect user
                    return callback({ 'body': {}, 'status': 404 }, null);
                }

                callback(null, { 'body': user, 'status': 200 });

            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el user " + searchParam, 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        findDiners: ['findUser', function (results, cb) {
            var user = results.findUser.body;
            user.getDiners().then(function (diners) {
                cb(null, { body: { user: user, diners: diners }, status: results.findUser.status });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Error en conseguir comedores del user" }, 'status': 500 }, null);
            });
        }],
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findDiners);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllUsers = function (req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("User", req.query));
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        usersCount: function (callback) {
            usersModel.count({ where: whereClosure }).then(function (usersQty) {
                callback(null, usersQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['usersCount', function (results, cb) {
            usersModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (usersCol) {
                var total_pages = Math.ceil(results.usersCount / page_size);
                var number_of_elements = usersCol.length;
                var result = {
                    users: usersCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.usersCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los users", 'fields': error.fields }, 'status': 500 }, null);
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

var createUser = function (userRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createUser: function (cb) {
            var postUser = getUserRequest(userRequest, true);
            usersModel.create(postUser).then(function (user) {
                cb(null, { 'body': user, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el user", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createUser);
        } else {
            responseCB(err, null);
        }
    });
}

var updateUser = function (searchParam, userRequest, responseCB) {
    console.log("entre a updatear");
    async.auto({
        // this function will just be passed a callback
        updateUser: function (callback) {
            getUser(searchParam, function (err, result) {
                if (!err) {
                    var user = result.body.user;
                    if (user) {
                        user.update(getUserRequest(userRequest, false)).then(function (updatedUser) {
                            callback(null, { 'body': updatedUser, 'status': 202 });
                        }).catch(error => {
                            console.log(error);
                            callback({ 'body': { 'result': 'No se puedo actualizar el usuario', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el usuario', 'fields': error.fields }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateUser);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteUser = function (idUser, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findUser: function (callback) {
            var user;
            getUser(idUser, function (err, result) {
                if (!err) {
                    user = result.body.user;
                    callback(null, user);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteUser: ['findUser', function (results, cb) {
            var user = results.findUser;
            var userResponse = {};
            if (user) {
                user.destroy().then(function (result) {
                    if (result == 1) {
                        userResponse.status = 200;
                        userResponse.result = "Se ha borrado el usuario " + idUser;
                    } else {
                        userResponse.status = 204;
                        userResponse.result = "No se ha podido borrar el usuario " + idUser;
                    }
                    cb(userResponse);
                }).catch(error => {
                    userResponse.status = 500;
                    userResponse.result = "Error eliminando el usuario " + idUser;
                    userResponse.fields = error.fields
                    cb(userResponse);
                });
            } else {
                userResponse.status = 404;
                userResponse.result = "No se encontro el usuario " + idUser;
                cb(userResponse);
            }

        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteUser);
        } else {
            responseCB(err, null);
        }
    });
}

var getUserRequest = function (request, shouldCreatePassword) {
    var hash = crypto.createHash('sha256');
    var password = request.pass;
    var userRequest = {
        name: request.name,
        surname: request.surname,
        alias: request.alias,
        mail: request.mail,
        phone: request.phone,
        street: request.street,
        streetNumber: request.streetNumber || request.street_number || null,
        floor: request.floor,
        door: request.door,
        role: request.role,
        docNum: request.docNum || request.doc_number || '',
        bornDate: request.bornDate || request.born_date,
        active: request.active
    };

    if (shouldCreatePassword == true) {
        userRequest.pass = hash.update(password).digest("base64");
    }

    userRequest = _.omitBy(userRequest, _.isUndefined);

    return userRequest;
};


module.exports = {
    getUserRequest: getUserRequest,
    getUser: getUser,
    getAllUsers: getAllUsers,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser
};