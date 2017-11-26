var express = require('express');
var router = express.Router();
var app = express();
var eventPhotosService = require('../services/eventPhotosService');

/* GET event photos listing. */
router.get('/:idEvent/:idPhoto?', function (req, res, next) {
    var idEvent = req.params.idEvent;
    var idPhoto = req.params.idPhoto;
    if (idEvent && idPhoto) {
        eventPhotosService.getEventPhoto(idEvent, idPhoto, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        eventPhotosService.getAllEventPhotos(idEvent, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de eventPhoto. */
router.post('/', function (req, res, next) {
    var eventPhotoRequest = req.body;
    eventPhotosService.createEventPhoto(eventPhotoRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idEvent/:idPhoto', function (req, res, next) {
    var eventPhotoRequest = {
        idEvent: req.params.idEvent,
        idPhoto: req.params.idPhoto,
        url: req.body.url
    };
    eventPhotosService.updateEventPhoto(eventPhotoRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idEvent/:idPhoto', function (req, res, next) {
    var idEvent = req.params.idEvent;
    var idPhoto = req.params.idPhoto;
    eventPhotosService.deleteEventPhoto(idEvent, idPhoto, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;