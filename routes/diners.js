var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var async = require('async');
var usersRouter = require('./users');
var enumsRouter = require('./enumerations');

/* GET diners listing. */
router.get('/:idDiner?', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var diners = models.Diner;
    var users = models.User;
    var usersDiners = models.UserDiner
    diners.belongsToMany(users, { through: usersDiners, foreignKey: 'idDiner' })
    users.belongsToMany(diners, { through: usersDiners, foreignKey: 'idUser' })
    if (idDiner) {
        diners.find({ where: { idDiner: idDiner } }).then(function (diner, err) {
            if (err) {
                // diner not found 
                return res.status(401).json({});
            }

            if (!diner) {
                // incorrect diner
                return res.status(404).json({});
            }

            var userFind = {};
            diner.getUsers().then(function (usersFind) {
                if (usersFind.length == 1) {
                    userFind = usersFind[0];
                }
                res.json({
                    diner: diner.toJSON(),
                    user: userFind
                });
            });
        });
    } else {
        getAllDiners(req, res, next);
    }
});


var getAllDiners = function (req, res, next) {
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
            });;
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
                cb(null, result)
            }).catch(error => {
                cb(error, null);
            });
        }]
    }, function (err, results) {
        res.json(results.paginate);
    });


}

/* POST de diners. */
router.post('/', function (req, res, next) {
    var diners = models.Diner;
    var usersDinerModel = models.UserDiner;
    var dinerRequest = req.body.diner;
    var userRequest = req.body.user;
    var idDiner;
    var postDiner = getDinerRequest(dinerRequest);
    postDiner.state = 0; //Se crea inactivo.
    var postUser = usersRouter.getPostUser(userRequest);
    diners.create(postDiner).then(function (diner) {
        idDiner = diner.idDiner;
        postUser.idDiner = idDiner;
        var users = models.User;
        var createdUser;
        users.create(postUser).then(function (user) {
            createdUser = user;
            usersDinerModel.create({ 'idDiner': idDiner, 'idUser': createdUser.idUser, 'active': 0 }).then(function (user) {
                res.status(201).json({ diner: diner, user: createdUser });
            });
        }).catch(error => {
            res.status(500).json({ 'result': 'Error creando el usuario' });
        });
    }).catch(error => {
        res.status(500).json({ 'result': 'Error creando el comedor' });
    });
});

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

router.put('/:idDiner', function (req, res, next) {
    var diners = models.Diner;
    var idDiner = req.params.idDiner;
    diners.find({ where: { idDiner: idDiner } }).then(function (diner) {
        if (diner) {
            diner.update({
                name: req.body.name,
                street: req.body.street,
                streetNumber: req.body.streetNumber,
                state: req.body.state,
                floor: req.body.floor,
                door: req.body.door,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                zipCode: req.body.zipCode,
                phone: req.body.phone,
                description: req.body.description,
                link: req.body.link,
                mail: req.body.mail,
            }).then(function (updatedDiner) {
                res.status(202).json(updatedDiner);
            }).catch(error => {
                res.status(500).json({ 'result': 'No se puedo actualizar el comedor' });
            });
        } else {
            res.status(404).json({ 'result': 'No se encontro el comedor ' + idDiner + ' para hacer el update' });
        }
    });
});

router.delete('/:idDiner', function (req, res, next) {
    var diners = models.Diner;
    var usersDinerModel = models.UserDiner;
    var idDiner = req.params.idDiner;
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


});

module.exports = router;