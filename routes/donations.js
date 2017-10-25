var express = require('express');
var router = express.Router();
var app = express();
var donationsService = require('../services/donationsService');

/* GET donation listing. */
router.get('/:idDonation?', function (req, res, next) {
    var idDonation = req.params.idDonation;
    if (idDonation) {
        donationsService.getDonation(idDonation, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        donationsService.getAllDonations(req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

router.get('/:idDonation/items/:idDonationItem?', function (req, res, next) {
    console.log("entre");
    var idDonation = req.params.idDonation;
    var idDonationItem = req.params.idDonationItem;
    if (idDonation && idDonationItem) {
        donationsService.getDonationItem(idDonation,idDonationItem, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    } else {
        donationsService.getAllDonationItemsByDonation(idDonation, req, function (err, result) {
            if (!err) {
                res.status(result.status).json(result.body);
            } else {
                res.status(err.status).json(err.body);
            }
        });
    }
});

/* POST de donation. */
router.post('/', function (req, res, next) {
    var donationRequest = req.body;
    donationsService.createDonation(donationRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

/* POST de donation. */
router.post('/items', function (req, res, next) {
    var donationItemRequest = req.body;
    donationsService.createDonationItem(donationItemRequest, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});


router.put('/:idDonation/items/:idDonationItem', function (req, res, next) {
    var idDonation = req.params.idDonation;
    var idDonationItem = req.params.idDonationItem;
    donationsService.updateDonationItem(idDonation,idDonationItem, req.body, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

router.delete('/:idDonation/items/:idDonationItem', function (req, res, next) {
    var idDonation = req.params.idDonation;
    var idDonationItem = req.params.idDonationItem;
    donationsService.deleteDonation(idDonation,idDonationItem, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;