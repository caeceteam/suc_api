var express = require('express');
var router = express.Router();
var app = express();
var dinerRequestsService = require('../services/dinerRequestsService');

/* GET food listing. */
router.get('/:idDinerRequest?', function (req, res, next) {
    var idDinerRequest = req.params.idDinerRequest;
    if (idDinerRequest) {
        dinerRequestsService.getDinerRequest(idDinerRequest, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        dinerRequestsService.getAllDinerRequests(req, function (err, result) {
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
    var dinerRequestRequest = req.body;
    dinerRequestsService.createDinerRequest(dinerRequestRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDinerRequest', function (req, res, next) {
    var idDinerRequest = req.params.idDinerRequest;
    dinerRequestsService.updateDinerRequest(idDinerRequest, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDinerRequest', function (req, res, next) {
    var idDinerRequest = req.params.idDinerRequest;
    dinerRequestsService.deleteDinerRequest(idDinerRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;