var express = require('express');
var router = express.Router();
var app = express();
var foodTypesService = require('../services/foodTypesService');

/* GET foodTypes listing. */
router.get('/:idFoodType?', function (req, res, next) {
    var idFoodType = req.params.idFoodType;
    if (idFoodType) {
        foodTypesService.getFoodType(idFoodType, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        foodTypesService.getAllFoodTypes(req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de foodTypes. */
router.post('/', function (req, res, next) {
    var foodTypeRequest = req.body;
    foodTypesService.createFoodType(foodTypeRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idFoodType', function (req, res, next) {
    var idFoodType = req.params.idFoodType;
    foodTypesService.updateFoodType(idFoodType, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idFoodType', function (req, res, next) {
    var idFoodType = req.params.idFoodType;
    foodTypesService.deleteFoodType(idFoodType, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;