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
    User.find({ where: Sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (user, err) {
      if (err) {
        // user not found 
        return res.status(401).json({ 'errorMessage': 'Ocurrio un error en la busqueda del usuario ' + searchParam });
      }

      if (!user) {
        // incorrect username
        return res.status(404).json({ 'errorMessage': 'No se encontro el usuario ' + searchParam });
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
    res.status(500).json({ 'result': 'Error creando al usuario' });
  });
});

router.getPostUser = getPostUser;
var getPostUser = function (request) {
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
};

router.put('/:searchParam', function (req, res, next) {
  var User = models.User;
  var searchParam = req.params.searchParam;
  User.find({ where: Sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (user) {
    if (user) {
      user.update({
        name: req.body.name,
        surname: req.body.surname,
        alias: req.body.alias,
        password: req.body.pass,
        mail: req.body.mail,
        idDiner: req.body.idDiner,
        phone: req.body.phone,
        role: req.body.role,
        docNumber: req.body.docNumber,
        bornDate: req.body.bornDate,
        state: req.body.state
      }).then(function (userResponse) {
        res.status(202).json(userResponse);
      }).catch(error => {
        console.log(error);
        res.status(error.errno);
      });
    } else {
      res.status(404).json({ 'result': 'No se encontro el user ' + searchParam })
    }
  });
});

router.delete('/:user', function (req, res, next) {
  var User = models.User;
  var userName = req.params.user;
  User.destroy({ where: Sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (result) {
    if (result == 1) {
      res.status(200).json({ 'result': "Se ha borrado el usuario " + userName });
    } else {
      res.status(204).json({ 'result': "No se ha podido borrar el usuario " + userName });
    }
  }).catch(error => {
    res.status(500).json({ 'result': 'Error eliminando el user' });;
  });
});

module.exports = router;
