var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');

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
    var postDiner = {
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

    diners.create(postDiner).then(function (diner) {
        idDiner = diner.idDiner;
        //Continuar con el alta de usuario.
        res.status(201).json(diner);
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });;
});


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
    var idDiner = req.params.idDiner;
    diners.destroy({ where: { idDiner: idDiner } }).then(function (result) {
        var status
        if (result == 1) {
            status = 200;
        } else {
            status = 204;
        }
        res.sendStatus(status);
    });
});

module.exports = router;