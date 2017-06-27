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
                return res.status(401).json({});
            }

            if (!foodType) {
                // incorrect foodType
                return res.status(404).json({});
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

    var postFoodType = {
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        perishable: req.body.perishable,
        diabetic: req.body.diabetic,
        celiac: req.body.celiac
    }

    foodTypes.create(postFoodType).then(function (foodType) {
        res.status(201).json(foodType);
    }).catch(error => {
        res.status(500).json({ 'result': 'Ocurrio un error creando el foodType' });
    });
});


router.put('/:idFoodType', function (req, res, next) {
    var foodTypes = models.FoodType;
    var idFoodType = req.params.idFoodType;
    foodTypes.find({ where: { idFoodType: idFoodType } }).then(function (foodType) {
        if (foodType) {
            foodType.update({
                code: req.body.code,
                name: req.body.name,
                description: req.body.description,
                perishable: req.body.perishable,
                diabetic: req.body.diabetic,
                celiac: req.body.celiac
            }).then(function (updatedFT) {
                res.status(202).json(foodType);
            }).catch(error => {
                res.status(500).json({ 'result': 'Ha ocurrido un error actulizando el foodType ' + idFoodType });
            });
        } else {
            res.status(404).json({ 'result': 'No se encontro el foodType ' + idFoodType + ' para hacer el update' });
        }
    });
});

router.delete('/:idFoodType', function (req, res, next) {
    var foodTypes = models.FoodType;
    var idFoodType = req.params.idFoodType;
    foodTypes.destroy({ where: { idFoodType: idFoodType } }).then(function (result) {
        if (result == 1) {
            res.status(200).json({ 'result': "Se ha borrado el foodType " + idFoodType });
        } else {
            res.status(204).json({ 'result': "No se ha podido borrar el foodType " + idFoodType });
        }
    }).catch(error => {
        res.status(500).json({ 'result': 'Error eliminando el foodType ' + idFoodType });
    });
});

module.exports = router;