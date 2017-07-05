var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var usersRouter = require('./users');
var enumsRouter = require('./enumerations');
var dinersService = require('../services/dinersService')

/* GET diners listing. */
router.get('/:idDiner?', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var diners = models.Diner;

    if (idDiner) {
        dinersService.getDiner(idDiner, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        dinersService.getAllDiners(req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de diners. */
router.post('/', function (req, res, next) {
    var idDiner;
    var dinerRequest = req.body.diner;
    var userRequest = req.body.user;

    dinersService.createDiner(dinerRequest, userRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
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
    var dinerRequest = dinersService.getDinerRequest(req.body);
    dinersService.updateDiner(idDiner, dinerRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
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