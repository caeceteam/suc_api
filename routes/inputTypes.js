var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
var expressValidator = require('express-validator');

app.use(expressValidator);

/* GET inputTypes listing. */
router.get('/:idInputType?', function (req, res, next) {
    var idInputType = req.params.idInputType;
    var inputTypes = models.InputType;
    if (idInputType) {
        inputTypes.find({ where: { idInputType: idInputType } }).then(function (inputType, err) {
            if (err) {
                // inputType not found 
                return res.status(401).json({});
            }

            if (!inputType) {
                // incorrect inputType
                return res.status(404).json({});
            }

            res.json({
                inputType: inputType.toJSON(),
            });
        });
    } else {
        var page_size = req.query.pageSize ? req.query.pageSize : 10;
        var page = req.query.page ? req.query.page : 0;
        var total_elements;
        inputTypes.count().then(function(quantity){
            total_elements = quantity;
        });
        inputTypes.findAll({ offset: page_size * page, limit: Math.ceil(page_size) }).then(function (inputTypesCol) {
            var total_pages = Math.ceil(total_elements / page_size);
            var number_of_elements = inputTypesCol.length;
            res.json({
                inputTypes: inputTypesCol,
                pagination: {
                    page: page,
                    size: page_size,
                    number_of_elements: number_of_elements,
                    total_pages: total_pages,
                    total_elements: total_elements
                }
            });
        });
    }
});

/* POST de inputTypes. */
router.post('/', function (req, res, next) {
    var inputTypes = models.InputType;
    var code = req.body.code;
    var name = req.body.name;
    var description = req.body.description;

    var postInputType = {
        code: code,
        name: name,
        description: description
    }

    inputTypes.create(postInputType).then(function (inputType) {
        res.status(201).json(inputType);
    }).catch(error => {
        res.status(500).json({ 'result': 'Error creando el inputType' });
    });;
});


router.put('/:idInputType', function (req, res, next) {
    var inputTypes = models.InputType;
    var idInputType = req.params.idInputType;
    inputTypes.find({ where: { idInputType: idInputType } }).then(function (inputType) {
        if (inputType) {
            inputType.udpdate({
                code: req.body.code,
                name: req.body.name,
                description: req.body.description
            }).then(function (updatedIT) {
                res.status(202).json(inputType);
            }).catch(error => {
                res.status(500).json({ 'result': 'Error actualizando el inputType' });;
            });
        } else {
            res.status(404).json({ 'result': 'No se encontro el inputType ' + idInputType + ' para hacer el update' });
        }

    });
});

router.delete('/:idInputType', function (req, res, next) {
    var inputTypes = models.InputType;
    var idInputType = req.params.idInputType;
    inputTypes.destroy({ where: { idInputType: idInputType } }).then(function (result) {
        if (result == 1) {
            res.status(200).json({ 'result': "Se ha borrado el inputType " + idInputType });
        } else {
            res.status(204).json({ 'result': "No se ha podido borrar el inputType " + idInputType });
        }
    }).catch(error => {
        res.status(500).json({ 'result': 'Error eliminando el inputType' });;
    });
});

module.exports = router;