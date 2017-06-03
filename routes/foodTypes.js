var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');

/* GET foodTypes listing. */
router.get('/:idFoodType?', function (req, res, next) {
    var idFoodType = req.params.idFoodType;
    var foodTypes = models.FoodType;
    if (idFoodType) {
        foodTypes.find({ where: { idFoodType: idFoodType } }).then(function (foodType, err) {
            if (err) {
                // foodType not found 
                return res.sendStatus(401);
            }

            if (!foodType) {
                // incorrect foodType
                return res.sendStatus(404);
            }

            res.json({
                foodType: foodType.toJSON(),
            });
        });
    } else {
        foodTypes.findAll().then(function (foodTypesCol) {
            res.json(foodTypesCol);
        });
    }
});

/* POST de foodTypes. */
router.post('/', function (req, res, next) {
    var foodTypes = models.FoodType;
    var code = req.body.code;
    var name = req.body.name;
    var description = req.body.description;

    var postFoodType = {
        code: code,
        name: name,
        description: description
    }

    foodTypes.create(postFoodType).then(function (foodType) {
        res.status(201).json(foodType);
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });;
});


router.put('/:idFoodType', function (req, res, next) {
    var foodTypes = models.FoodType;
    var idFoodType = req.params.idFoodType;
    foodTypes.find({ where: {idFoodType: idFoodType} }).then(function (foodType) {
        foodType.code = req.body.code;
        foodType.name = req.body.name;
        foodType.description = req.body.description;
        foodType.save();
        res.status(202).json(foodType);
    });
});

router.delete('/:idFoodType', function (req, res, next) {
var foodTypes = models.FoodType;
  var idFoodType = req.params.idFoodType;
  foodTypes.destroy({where:{ idFoodType: idFoodType }}).then(function (result) {
    var status
    if(result == 1){
      status = 200;
    }else{
      status = 204;
    }
    res.sendStatus(status);
  }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });
});

module.exports = router;