var express = require('express');
var router = express.Router();
var app = express();
var emailsService = require('../services/emailService')

router.post('/', function (req, res, next) {
    try {
        switch (req.body.mail_type) {
            case 0:
                result = emailsService.sendRegistration(req.body, function (response) {
                    res.status(response.status).json(response.result);
                });
                break;
            case 1:
                result = emailsService.sendRegistrationApprovedMail(req.body, function (response) {
                    res.status(response.status).json(response.result);
                });
                break;
            case 2:
                result = emailsService.sendRegistrationRejectedMail(req.body, function (response) {
                    res.status(response.status).json(response.result);
                });
                break;
            case 3:
                result = emailsService.sendNoValidatableRegistration(req.body, function (response) {
                    res.status(response.status).json(response.result);
                });
                break;
        };
    } catch (ex) {
        console.log(ex);
        res.status(500).json({});
    }

});

module.exports = router;