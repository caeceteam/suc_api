var express = require('express');
var router = express.Router();
var app = express();
var emailsService = require('../services/emailService')

router.post('/', function (req, res, next) {
    try{
        switch (req.body.mail_type) {
            case 0:
                emailsService.sendRegistration(req.body);
                break;
            case 1:
                emailsService.sendRegistrationApprovedMail(req.body);
                break;
            case 2:
                emailsService.sendRegistrationRejectedMail(req.body);
                break;
        };

        res.status(200).json({});
    }catch(ex){
        res.status(500).json({});
    }
    
});

module.exports = router;