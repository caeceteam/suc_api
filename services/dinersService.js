var models = require('../models/');
var usersService = require('./usersService');
var async = require('async');

var getDiner = function (idDiner, responseCB) {
    var diners = models.Diner;
    var dinerResponse = { status: 200, json: {} };
    var users = models.User;
    var usersDiners = models.UserDiner
    diners.belongsToMany(users, { through: usersDiners, foreignKey: 'idDiner' });
    users.belongsToMany(diners, { through: usersDiners, foreignKey: 'idUser' });

    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            diners.find({ where: { idDiner: idDiner } }).then(function (diner, err) {
                if (err) {
                    // diner not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!diner) {
                    // incorrect diner
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                console.log("encontro diner");
                callback(null, { 'body': diner, 'status': 200 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el diner " + idDiner }, 'status': 500 }, null);
            });
        },
        endedDinerResponse: ['findDiner', function (results, cb) {
            var userFound = {};
            results.findDiner.body.getUsers().then(function (usersFound) {
                if (usersFound.length == 1) {
                    userFound = usersFound[0];
                }
                dinerResponse = {
                    diner: results.findDiner.body.toJSON(),
                    user: userFound
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
    var diners = models.Diner;

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
        count: function (callback) {
            diners.count().then(function (quantity) {
                callback(null, quantity)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['count', function (results, cb) {
            diners.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (dinersCol) {
                var total_pages = Math.ceil(results.count / page_size);
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
    var diners = models.Diner;
    var users = models.User;
    var usersDiners = models.UserDiner;


    diners.belongsToMany(users, { through: usersDiners, foreignKey: 'idDiner' });
    users.belongsToMany(diners, { through: usersDiners, foreignKey: 'idUser' });

    async.auto({
        // this function will just be passed a callback
        createDiner: function (callback) {
            var postDiner = getDinerRequest(dinerRequest);
            postDiner.state = 0; //Se crea inactivo.
            diners.create(postDiner).then(function (diner) {
                callback(null, { 'body': diner, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el diner" }, 'status': 500 }, null);
            });
        },
        createUser: ['createDiner', function (results, cb) {
            var createdUser;
            var postUser = usersService.getUserRequest(userRequest);
            var diner = results.createDiner.body;
            postUser.idDiner = diner.idDiner;
            users.create(postUser).then(function (user) {
                diner.addUser(user);
                var result = { diner: diner, user: user };
                cb(null, { 'body': result, 'status': 201 })
            }).catch(error => {
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
    var diners = models.Diner;
    async.auto({
        // this function will just be passed a callback
        updateDiner: function (callback) {
            diners.find({ where: { idDiner: idDiner } }).then(function (diner) {
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

var deleteDiner = function(idDiner,responseCB){
    var diners = models.Diner;
    var usersDinerModel = models.UserDiner;
    var users;
    usersDinerModel.findAll({ where: { idDiner: idDiner } }).then(function (usersResult) {
        users = usersResult;
        if (users.length == 0) {
            diners.destroy({ where: { idDiner: idDiner } }).then(function (result) {
                if (result == 1) {
                    res.status(200).json({ 'result': "Se ha borrado el comedor " + idDiner });
                } else {
                    res.status(204).json({ 'result': "No se ha podido borrar el comedor " + idDiner });
                }
            }).catch(error => {
                res.status(500).json({ 'result': 'Error eliminando el comedor ' + idDiner });
            });
        } else {
            diners.find({ where: { idDiner: idDiner } }).then(function (diner) {
                if (diner) {
                    diner.state = 0;
                    diner.save();
                    res.status(202).json(diner);

                } else {
                    res.status(404).json({ 'result': 'No se encontro el comedor ' + idDiner });
                }
            });
        }
    }).catch(error => {
        res.status(500).json({ 'result': 'Error eliminando el comedor ' + idDiner });
    });
}

module.exports = {
    getAllDiners: getAllDiners,
    getDiner: getDiner,
    createDiner: createDiner,
    updateDiner: updateDiner,
    getDinerRequest: getDinerRequest,
    deleteDiner: deleteDiner
};