var express = require('express');
var router = express.Router();
var authenticationService = require('../services/authenticationService');

/* Authenticate user and return token. */
router.post('/', function (req, res, next) {
  console.log(req.body);
  var credentials = {
    userName: req.body.userName || req.body.user_name,
    password: req.body.password
  };
  authenticationService.authenticate(credentials, function (err, result) {
    if (!err) {
      res.status(result.status).json(result.body);
    } else {
      res.status(err.status).json(err.body);
    }
  });
});

router.put('/', function (req, res, next) {
  var credentials = {
    userName: req.body.userName,
    password: req.body.oldPassword
  };
  var newPassword = req.body.newPassword;
  var cleaningPass = req.headers['x-cleaning-pass'];
  if(cleaningPass != "xsc"){
    authenticationService.updatePassword(credentials, newPassword, function (err, result) {
      if (!err) {
        res.status(result.status).json(result.body);
      } else {
        res.status(err.status).json(err.body);
      }
    });
  }else{
    authenticationService.cleanPassword(credentials, function (err, result) {
      if (!err) {
        res.status(result.status).json(result.body);
      } else {
        res.status(err.status).json(err.body);
      }
    });
  }
});



module.exports = router;
