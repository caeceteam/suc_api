var express = require('express');
var router = express.Router();
var app = express();
var usersDinersService = require('../services/usersDinersService');

/* GET diner users listing. */
router.get('/', function (req, res, next) {
    usersDinersService.getUsersDiners(req, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

/* POST de dinerUser. */
router.post('/', function (req, res, next) {
    usersDinersService.createUserDiner(req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDiner/:idUser', function (req, res, next) {
    var userDinerRequest = {
        idDiner: req.params.idDiner,
        idUser: req.params.idUser,
        active: req.body.active
    };
    usersDinersService.updateUserDiner(userDinerRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDiner/:idUser', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var idUser = req.params.idUser;
    usersDinersService.deleteUserDiner(idDiner, idUser, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;