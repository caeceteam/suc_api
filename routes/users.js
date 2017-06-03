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
  var postUser = getPostUser(req.body);
  User.create(postUser).then(function (user) {
    res.status(201).json(user);
  }).catch(error => {
    console.log(error);
    res.status(error.errno);
  });;

});

router.getPostUser = function(request){
  var hash = crypto.createHash('sha256');
  var password = request.pass;
  var hashedPass = hash.update(password).digest("base64");
  return {
    name: request.name,
    surname: request.surname,
    alias: request.alias,
    pass: hashedPass,
    mail: request.mail,
    phone: request.phone, idDiner: request.idDiner, role: request.role,
    docNumber: request.docNumber, bornDate: request.bornDate, state: request.state
  };
}

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
  }).catch(error => {
        console.log(error);
        res.status(error.errno);
    });
});

module.exports = router;
