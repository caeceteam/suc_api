var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');

/* GET inputTypes listing. */
router.get('/:idInputType?', function (req, res, next) {
    var idInputType = req.params.idInputType;
    var inputTypes = models.InputType;
    if (idInputType) {
        inputTypes.find({ where: { idInputType: idInputType } }).then(function (inputType, err) {
            if (err) {
                // inputType not found 
                return res.sendStatus(401);
            }

            if (!inputType) {
                // incorrect inputType
                return res.sendStatus(404);
            }

            res.json({
                inputType: inputType.toJSON(),
            });
        });
    } else {
        inputTypes.findAll().then(function (inputTypesCol) {
            res.json(inputTypesCol);
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
        console.log(error);
        res.status(error.errno);
    });;
});


router.put('/:idInputType', function (req, res, next) {
    var inputTypes = models.InputType;
    var idInputType = req.params.idInputType;
    inputTypes.find({ where: {idInputType: idInputType} }).then(function (inputType) {
        inputType.code = req.body.code;
        inputType.name = req.body.name;
        inputType.description = req.body.description;
        inputType.save();
        res.status(202).json(inputType);
    });
});

router.delete('/:idInputType', function (req, res, next) {
var inputTypes = models.InputType;
  var idInputType = req.params.idInputType;
  inputTypes.destroy({where:{ idInputType: idInputType }}).then(function (result) {
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