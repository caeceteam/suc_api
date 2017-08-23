var express = require('express');
var router = express.Router();
var app = express();
var eventsService = require('../services/eventsService');

/* GET users listing. */
router.get('/:idEvent?', function (req, res, next) {
    var idEvent = req.params.idEvent;
    if (idEvent) {
        eventsService.getEvent(idEvent, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        var idDiner = req.query.idDiner;
        eventsService.getAllEvents(idDiner,req, function (err, result) {
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
    var eventRequest = req.body;
    eventsService.createEvent(eventRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.put('/:idEvent', function (req, res, next) {
    var idEvent = req.params.idEvent;
    eventsService.updateEvent(idEvent, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idEvent', function (req, res, next) {
    var idEvent = req.params.idEvent;
    eventsService.deleteEvent(idEvent, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;