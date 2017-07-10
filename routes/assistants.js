var express = require('express');
var router = express.Router();
var app = express();
var assistantsService = require('../services/assistantsService');

/* GET users listing. */
router.get('/:idAssistant?', function (req, res, next) {
    var idAssistant = req.params.idAssistant;
    if (idAssistant) {
        assistantsService.getAssistant(idAssistant, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        var idDiner = req.query.idDiner;
        assistantsService.getAllAssistants(idDiner,req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de user. */
router.post('/', function (req, res, next) {
    var assistantRequest = req.body;
    assistantsService.createAssistant(assistantRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.put('/:idAssistant', function (req, res, next) {
    var idAssistant = req.params.idAssistant;
    assistantsService.updateAssistant(idAssistant, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idAssistant', function (req, res, next) {
    var idAssistant = req.params.idAssistant;
    assistantsService.deleteAssistant(idAssistant, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;
