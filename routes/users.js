var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
const crypto = require('crypto');
/* GET users listing. */
router.get('/:user?', function (req, res, next) {
  var User = models.User;
  var searchParam = req.params.user;
  if (searchParam) {
    User.find({ where: Sequelize.or({ alias: searchParam }, { mail: searchParam }) }).then(function (user, err) {
      if (err) {
        // user not found 
        return res.sendStatus(401);
      }

      if (!user) {
        // incorrect username
        return res.sendStatus(404);
      }

      res.json({
        user: user.toJSON(),
      });
    });
  } else {
    User.findAll().then(function (users) {
      res.json(users);
    });
  }

});

/* POST de user. */
router.post('/:user?', function (req, res, next) {
  var User = models.User;
  var hash = crypto.createHash('sha256');

  var name = req.body.name;
  var surname = req.body.surname;
  var alias = req.body.alias;
  var password = req.body.pass;
  var mail = req.body.mail;
  var idDiner = req.body.idDiner;
  var phone = req.body.phone;
  var role = req.body.role;
  var docNumber = req.body.docNumber;
  var bornDate = req.body.bornDate;
  var state = req.body.state;
  var hashedPass = hash.update(password).digest("base64");
  console.log(hashedPass);
  var postUser = {
    name: name,
    surname: surname,
    alias: alias,
    pass: hashedPass,
    mail: mail,
    phone: phone, idDiner: idDiner, role: role,
    docNumber: docNumber, bornDate: bornDate,state:state
  };
  console.log(postUser);
  User.create(postUser).then(function (user) {
    res.json(user);
  }).catch(error => {
                console.log(error);
      });;

});

module.exports = router;
