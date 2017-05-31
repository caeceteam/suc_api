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
  var postUser = {
    name: name,
    surname: surname,
    alias: alias,
    pass: hashedPass,
    mail: mail,
    phone: phone, idDiner: idDiner, role: role,
    docNumber: docNumber, bornDate: bornDate, state: state
  };
  User.create(postUser).then(function (user) {
    res.status(201).json(user);
  }).catch(error => {
    console.log(error);
    res.status(error.errno);
  });;

});


router.put('/:user', function (req, res, next) {
  var User = models.User;
  var userName = req.params.user;
  User.find({ where: Sequelize.or({ alias: userName }, { mail: userName }) }).then(function (user) {
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.alias = req.body.alias;
    user.password = req.body.pass;
    user.mail = req.body.mail;
    user.idDiner = req.body.idDiner;
    user.phone = req.body.phone;
    user.role = req.body.role;
    user.docNumber = req.body.docNumber;
    user.bornDate = req.body.bornDate;
    user.state = req.body.state;
    user.save();
    res.status(202).json(user);
  });
});

router.delete('/:user', function (req, res, next) {
  var User = models.User;
  var userName = req.params.user;
  User.destroy({where:{ alias: userName }}).then(function (result) {
    var status
    if(result == 1){
      status = 200;
    }else{
      status = 204;
    }
    res.sendStatus(status);
  });
});

module.exports = router;
