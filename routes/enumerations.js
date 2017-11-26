var express = require('express');
var router = express.Router();
var models = require('../models/');
var enumerations = require('../enums/enumerations');
var app = express();

/* GET enumerations listing. */
router.get('/', function (req, res, next) {
    return res.json(enumerations.enums);
});


module.exports = router;