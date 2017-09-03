var express = require('express');
var router = express.Router();
var app = express();
var dinersService = require('../services/dinersService')

/* GET diners listing. */
router.get('/:idDiner?', function (req, res, next) {
    var idDiner = req.query.idDiner;
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

router.put('/:idDiner', function (req, res, next) {
    var idDiner = req.params.idDiner;
    dinersService.updateDiner(idDiner, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDiner', function (req, res, next) {
    var idDiner = req.params.idDiner;
    dinersService.deleteDiner(idDiner, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;