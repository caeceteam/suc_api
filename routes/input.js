var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var usersRouter = require('./users');

/* GET input listing. */
router.get('/:idInput?', function (req, res, next) {
    var idInput = req.params.idInput;
    var inputs = models.Input;
    if (idInput) {
        inputs.find({ where: { idInput: idInput } }).then(function (input, err) {
            if (err) {
                // foodType not found 
                return res.sendStatus(401);
            }

            if (!input) {
                // incorrect foodType
                return res.sendStatus(404);
            }

            res.json({
                input: input.toJSON(),
            });
        });
    } else {
        inputs.findAll().then(function (inputsCol) {
            res.json(inputsCol);
        });
    }
});

/* POST de input. */
router.post('/', function (req, res, next) {
    var inputs = models.Input;
    var inputRequest = {
        name: req.body.name,
        gender: req.body.gender,
        size: req.body.size,
        quantity: req.body.quantity,
        idInputType: req.body.idInputType
    }
    inputs.create(inputRequest).then(function (input) {
        res.status(201).json(input);
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });;
});


router.put('/:idInput', function (req, res, next) {
    var inputs = models.Input;
    var idInput = req.params.idInput;
    inputs.find({ where: { idInput: idInput } }).then(function (input) {
        input.name = req.body.name;
        input.size = req.body.size;
        input.gender = req.body.gender;
        input.quantity = req.body.quantity;
        input.idInputType = req.body.idInputType;
        input.save();
        res.status(202).json(input);
    });
});

router.delete('/:idInput', function (req, res, next) {
    var inputs = models.Input;
    var idInput = req.params.idInput;
    inputs.destroy({ where: { idInput: idInput } }).then(function (result) {
        var status
        if (result == 1) {
            status = 200;
        } else {
            status = 204;
        }
        res.sendStatus(status);
    }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });
});

module.exports = router;