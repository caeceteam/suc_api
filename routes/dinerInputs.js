var express = require('express');
var router = express.Router();
var app = express();
var dinerInputsService = require('../services/dinerInputsService');

/* GET input listing. */
router.get('/:idDinerInput?', function (req, res, next) {
    var idDinerInput = req.params.idDinerInput;
    var idDiner = req.query.idDiner;
    if (idDinerInput) {
        dinerInputsService.getDinerInput(idDinerInput, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        dinerInputsService.getAllDinerInputs(idDiner, req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de input. */
router.post('/', function (req, res, next) {
    var dinerInputRequest = req.body;
    dinerInputsService.createDinerInput(dinerInputRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDinerInput', function (req, res, next) {
    var idDinerInput = req.params.idDinerInput;
    dinerInputsService.updateDinerInput(idDinerInput, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDinerInput', function (req, res, next) {
    var idDinerInput = req.params.idDinerInput;
    dinerInputsService.deleteDinerInput(idDinerInput, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;