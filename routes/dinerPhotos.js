var express = require('express');
var router = express.Router();
var app = express();
var dinerPhotosService = require('../services/dinerPhotosService');

/* GET diner photos listing. */
router.get('/:idDiner/:idPhoto?', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var idPhoto = req.params.idPhoto;
    if (idDiner && idPhoto) {
        dinerPhotosService.getDinerPhoto(idDiner, idPhoto, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        dinerPhotosService.getAllDinerPhotos(idDiner, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de dinerPhoto. */
router.post('/', function (req, res, next) {
    var dinerPhotoRequest = req.body;
    dinerPhotosService.createDinerPhoto(dinerPhotoRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDiner/:idPhoto', function (req, res, next) {
    var dinerPhotoRequest = {
        idDiner: req.params.idDiner,
        idPhoto: req.params.idPhoto,
        url: req.body.url
    };
    dinerPhotosService.updateDinerPhoto(dinerPhotoRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDiner/:idPhoto', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var idPhoto = req.params.idPhoto;
    dinerPhotosService.deleteDinerPhoto(idDiner, idPhoto, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;