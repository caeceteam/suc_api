var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var usersRouter = require('./users');

/* GET foodTypes listing. */
router.get('/:idDiner?', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var diners = models.Diner;
    if (idDiner) {
        diners.find({ where: { idDiner: idDiner } }).then(function (diner, err) {
            if (err) {
                // foodType not found 
                return res.sendStatus(401);
            }

            if (!diner) {
                // incorrect foodType
                return res.sendStatus(404);
            }

            res.json({
                diner: diner.toJSON(),
            });
        });
    } else {
        diners.findAll().then(function (dinersCol) {
            res.json(dinersCol);
        });
    }
});

/* POST de foodTypes. */
router.post('/', function (req, res, next) {
    var diners = models.Diner;
    var dinerRequest = req.body.diner;
    var userRequest = req.body.user;
    var idDiner;
    var postDiner = getDinerRequest(dinerRequest);
    var postUser = usersRouter.getPostUser(userRequest);
    diners.create(postDiner).then(function (diner) {
        idDiner = diner.idDiner;
        postUser.idDiner = idDiner;
        var users = models.User;
        var createdUser;
        users.create(postUser).then(function (user) {
            createdUser = user;
            res.status(201).json({ diner: diner, user: createdUser });
        }).catch(error => {
            console.log(error);
            res.status(error.errno);
        });
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });
});

var getDinerRequest = function (dinerRequest) {
    return {
        name: dinerRequest.name,
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
        idCity: dinerRequest.idCity
    }
}

router.put('/:idDiner', function (req, res, next) {
    var diners = models.Diner;
    var idDiner = req.params.idDiner;
    diners.find({ where: { idDiner: idDiner } }).then(function (diner) {
        diner.name = req.body.name;
        diner.street = req.body.street;
        diner.streetNumber = req.body.streetNumber;
        diner.floor = req.body.floor;
        diner.door = req.body.door;
        diner.latitude = req.body.latitude;
        diner.longitude = req.body.longitude;
        diner.zipCode = req.body.zipCode;
        diner.phone = req.body.phone;
        diner.description = req.body.description;
        diner.link = req.body.link;
        diner.mail = req.body.mail;
        diner.idCity = req.body.idCity;

        diner.save();
        res.status(202).json(diner);
    });
});

router.delete('/:idDiner', function (req, res, next) {
    var diners = models.Diner;
    var usersModel = models.User;
    var idDiner = req.params.idDiner;
    var users;
    usersModel.findAll({ where: { idDiner: idDiner } }).then(function (usersResult) {
        users = usersResult;
        if (users.length == 0) {
            diners.destroy({ where: { idDiner: idDiner } }).then(function (result) {
                var status
                if (result == 1) {
                    status = 200;
                } else {
                    status = 204;
                }
                res.sendStatus(status);
            }).catch(error => {
                console.log(error);
                res.status(error.errno);
            });
        } else {
            diners.find({ where: { idDiner: idDiner } }).then(function (diner) {
                diner.state = 0;
                diner.save();
                res.status(202).json(diner);
            });
        }
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });


});

module.exports = router;