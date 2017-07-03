var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');

/* GET diner photos listing. */
router.get('/:idDiner/:idPhoto?', function (req, res, next) {
    var idDiner = req.params.idDiner;
    var idPhoto = req.params.idPhoto;

    var dinerPhotos = models.DinerPhoto;
    if (idDiner && idPhoto) {
        dinerPhotos.find({ where: Sequelize.and({ idDiner: idDiner }, { idPhoto: idPhoto }) }).then(function (dinerPhoto, err) {
            if (err) {
                // dinerPhoto not found 
                return res.status(401).json({});
            }

            if (!dinerPhoto) {
                // incorrect dinerPhoto
                return res.status(404).json({});
            }

            res.json({
                dinerPhoto: dinerPhoto.toJSON(),
            });
        });
    } else {
        dinerPhotos.findAll().then(function (dinerPhotosCol) {
            res.json({
                dinerPhotos: dinerPhotosCol
            });
        });
    }
});

/* POST de dinerPhoto. */
router.post('/', function (req, res, next) {
    var dinerPhotos = models.DinerPhoto;
    var dinerPhotoRequest = {
        idDiner: req.body.idDiner,
        url: req.body.url
    }
    dinerPhotos.create(dinerPhotoRequest).then(function (dinerPhoto) {
        res.status(201).json(dinerPhoto);
    }).catch(error => {
        console.log(error);
        res.status(500).json({ 'result': 'Ha ocurrido un error creando el dinerPhoto' });
    });
});


router.put('/:idDiner/:idPhoto', function (req, res, next) {
    var dinerPhotos = models.DinerPhoto;
    var idDiner = req.params.idDiner;
    var idPhoto = req.params.idPhoto;

    dinerPhotos.find({ where: Sequelize.and({ idDiner: idDiner }, { idPhoto: idPhoto }) }).then(function (dinerPhoto) {
        if (dinerPhoto) {
            dinerPhoto.update({
                url: req.body.url
            }).then(function (updatedDP) {
                res.status(202).json(updatedDP);
            }).catch(error => {
                res.status(500).json({ 'result': 'Ha ocurrido un error actualizando el dinerPhoto idDiner ' + idDiner + ' idPhoto ' + idPhoto });
            });
        } else {
            res.status(404).json({ 'result': 'No se encontro el dinerPhoto idDiner ' + idDiner + ' idPhoto ' + idPhoto + ' para actualizar' });
        }
    });
});

router.delete('/:idDiner/:idPhoto', function (req, res, next) {
    var dinerPhotos = models.DinerPhoto;
    var idDiner = req.params.idDiner;
    var idPhoto = req.params.idPhoto;
    dinerPhotos.destroy({ where: Sequelize.and({ idDiner: idDiner }, { idPhoto: idPhoto }) }).then(function (result) {
        if (result == 1) {
            res.status(200).json({ 'result': 'Se ha borrado el dinerPhoto idDiner'  + idDiner + ' idPhoto ' + idPhoto });
        } else {
            res.status(204).json({ 'result': 'No se ha podido borrar el dinerPhoto idDiner ' + idDiner + ' idPhoto ' + idPhoto });
        }
    }).catch(error => {
        res.status(500).json({ 'result': 'Ha ocurrido un error eliminando el dinerPhoto idDiner ' + idDiner + ' idPhoto ' + idPhoto });
    });
});

module.exports = router;