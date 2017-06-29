var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();

var enumerations = {
    dinerStates: {
        "pending": 0,
        "approved": 1,
        "rejected": 2
    },
    userActive: {
        "false": 0,
        "true": 1
    }
};

router.enumerations = enumerations;

/* GET enumerations listing. */
router.get('/', function (req, res, next) {
    return res.json(enumerations);
});


module.exports = router;