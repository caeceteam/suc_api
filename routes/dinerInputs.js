var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var usersRouter = require('./users');

/* GET input listing. */
router.get('/:idDinerInput?', function (req, res, next) {
    var idDinerInput = req.params.idDinerInput;
    var dinerInputs = models.DinerInput;
    if (idDinerInput) {
        dinerInputs.find({ where: { idDinerInput: idDinerInput } }).then(function (dinerInput, err) {
            if (err) {
                // foodType not found 
                return res.status(401).json({});
            }

            if (!dinerInput) {
                // incorrect foodType
                return res.status(404).json({});
            }

            res.json({
                dinerInput: dinerInput.toJSON(),
            });
        });
    } else {
        dinerInputs.findAll().then(function (dinerInputsCol) {
            res.json(dinerInputsCol);
        });
    }
});

/* POST de input. */
router.post('/', function (req, res, next) {
    var dinerInnputs = models.DinerInput;
    var dinerInputRequest = {
        idDiner: req.body.idDiner,
        idInputType: req.body.idInputType,
        name: req.body.name,
        genderType: req.body.genderType,
        size: req.body.size,
        quantity: req.body.quantity,
        description: req.body.description
    }
    dinerInnputs.create(dinerInputRequest).then(function (dinerInput) {
        res.status(201).json(dinerInput);
    }).catch(error => {
        console.log(error);
        res.status(500).json({ 'result': 'Ha ocurrido un error creando el dinerInput' });
    });
});


router.put('/:idDinerInput', function (req, res, next) {
    var dinerInputs = models.DinerInput;
    var idDinerInput = req.params.idDinerInput;
    dinerInputs.find({ where: { idDinerInput: idDinerInput } }).then(function (dinerInput) {
        if (dinerInput) {
            dinerInput.update({
                idDiner: req.body.idDiner,
                idInputType: req.body.idInputType,
                name: req.body.name,
                genderType: req.body.genderType,
                size: req.body.size,
                quantity: req.body.quantity,
                description: req.body.description
            }).then(function (updatedDI) {
                res.status(202).json(updatedDI);
            }).catch(error => {
                res.status(500).json({ 'result': 'Ha ocurrido un error actualizando el dinerInput ' + idDinerInput });
            });
        } else {
            res.status(404).json({ 'result': 'No se encontro el dinerInput ' + idDinerInput + ' para actualizar' });
        }
    });
});

router.delete('/:idDinerInput', function (req, res, next) {
   var dinerInputs = models.DinerInput;
    var idDinerInput = req.params.idDinerInput;
    dinerInputs.destroy({ where: { idDinerInput: idDinerInput } }).then(function (result) {
        if (result == 1) {
             res.status(200).json({ 'result': "Se ha borrado el dinerInput " + idDinerInput });
        } else {
            res.status(204).json({ 'result': "No se ha podido borrar el dinerInput " + idDinerInput });
        }
    }).catch(error => {
        res.status(500).json({ 'result': 'Ha ocurrido un error eliminando el dinerInput ' + idDinerInput });
    });
});

module.exports = router;