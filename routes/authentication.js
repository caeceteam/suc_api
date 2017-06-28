var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple')
var models = require('../models/');
var app = express();
var moment = require('moment');
var expires = moment().add(7, 'days').valueOf();
var Sequelize = require('sequelize');
const crypto = require('crypto');
app.set('jwtTokenSecret', 'sucapi-2017_');

/* Authenticate user and return token. */
router.post('/', function (req, res, next) {
  var userName = req.body.userName;
  var password = req.body.password;
  var hash = crypto.createHash('sha256');
  var User = models.User;

  User.find({ where: Sequelize.or({ idUser: userName },{ alias: userName }, { mail: userName }) }).then(function (user, err) {
    if (err) {
      // user not found 
      return res.status(401).json({});
    }

    if (!user) {
      // incorrect username
      return res.status(404).json({});
    }

    var hashedPass = hash.update(password).digest("base64");
    if (user.pass !== hashedPass) {
      // incorrect password
      return res.status(401).json({});
    }
    // User has authenticated OK
    var token = jwt.encode({
      iss: user.idUser,
      exp: expires
    }, app.get('jwtTokenSecret'));

    res.json({
      token: token,
      expires: expires
    });
  });
});

router.put('/', function (req, res, next) {
  var userName = req.body.userName;
  var oldPassword = req.body.oldPassword;
  var newPassword = req.body.newPassword;
  var oldHash = crypto.createHash('sha256');
  var newHash = crypto.createHash('sha256');

  var User = models.User;

  User.find({ where: Sequelize.or({ idUser: userName },{ alias: userName }, { mail: userName }) }).then(function (user, err) {
    if (err) {
      // user not found 
      return res.status(401).json({});
    }

    if (!user) {
      // incorrect username
      return res.status(404).json({});
    }

    var oldHashedPass = oldHash.update(oldPassword).digest("base64");
    var newHashedPass = newHash.update(newPassword).digest("base64");
    if (user.pass !== oldHashedPass) {
      // incorrect password
      return res.status(401).json({});
    }

    user.pass = newHashedPass;
    user.save();
    // User has authenticated OK
    var token = jwt.encode({
      iss: user.idUser,
      exp: expires
    }, app.get('jwtTokenSecret'));

    res.json({
      token: token,
      expires: expires
    });

  });
});



module.exports = router;
