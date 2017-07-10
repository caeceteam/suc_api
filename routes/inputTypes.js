var express = require('express');
var router = express.Router();
var app = express();
var inputTypesService = require('../services/inputTypesService');


/* GET inputTypes listing. */
router.get('/:idInputType?', function (req, res, next) {
    var idInputType = req.params.idInputType;
    if (idInputType) {
        inputTypesService.getInputType(idInputType, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        inputTypesService.getAllInputTypes(req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de inputTypes. */
router.post('/', function (req, res, next) {
    var inputTypeRequest = req.body;
    inputTypesService.createInputType(inputTypeRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idInputType', function (req, res, next) {
    var idInputType = req.params.idInputType;
    inputTypesService.updateInputType(idInputType, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idInputType', function (req, res, next) {
    var idInputType = req.params.idInputType;
    inputTypesService.deleteInputType(idInputType, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;