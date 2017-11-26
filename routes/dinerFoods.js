var express = require('express');
var router = express.Router();
var app = express();
var dinerFoodsService = require('../services/dinerFoodsService');

/* GET food listing. */
router.get('/:idDinerFood?', function (req, res, next) {
    var idDinerFood = req.params.idDinerFood;
    var idDiner = req.query.idDiner;
    if (idDinerFood) {
        dinerFoodsService.getDinerFood(idDinerFood, function (err, result) {
            if (!err) {
                var dinerFoodAndType = result.body;
                console.log(dinerFoodAndType);
                var dinerFoodJson = dinerFoodAndType.dinerFood.toJSON();
                dinerFoodJson.idFoodType = undefined;
                dinerFoodJson.foodType = dinerFoodAndType.foodType.toJSON();
                res.status(result.status).json(dinerFoodJson);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        dinerFoodsService.getAllDinerFoods(idDiner, req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de food. */
router.post('/', function (req, res, next) {
    var dinerFoodRequest = req.body;
    dinerFoodsService.createDinerFood(dinerFoodRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDinerFood', function (req, res, next) {
    var idDinerFood = req.params.idDinerFood;
    dinerFoodsService.updateDinerFood(idDinerFood, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDinerFood', function (req, res, next) {
    var idDinerFood = req.params.idDinerFood;
    dinerFoodsService.deleteDinerFood(idDinerFood, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;