var express = require('express');
var router = express.Router();
var models = require('../models/');
var app = express();
var Sequelize = require('sequelize');
const crypto = require('crypto');
/* GET users listing. */
router.get('/:user?', function (req, res, next) {
  var users = models.User;
  var searchParam = req.params.user;
  if (searchParam) {
    users.find({ where: Sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (user, err) {
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
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;
    users.count().then(function (quantity) {
      total_elements = quantity;
    });
    users.findAll({ offset: page_size * page, limit: Math.ceil(page_size) }).then(function (usersCol) {
      var total_pages = Math.ceil(total_elements / page_size);
      var number_of_elements = usersCol.length;
      res.json({
        users: usersCol,
        pagination: {
          page: page,
          size: page_size,
          number_of_elements: number_of_elements,
          total_pages: total_pages,
          total_elements: total_elements
        }
      });
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

router.getPostUser = getPostUser;


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
  var searchParam = req.params.user;
  User.destroy({ where: Sequelize.or({ idUser: searchParam }, { alias: searchParam }, { mail: searchParam }) }).then(function (result) {
    if (result == 1) {
      res.status(200).json({ 'result': "Se ha borrado el usuario " + searchParam });
    } else {
      res.status(204).json({ 'result': "No se ha podido borrar el usuario " + searchParam });
    }
  }).catch(error => {
    console.log(error);
    res.status(500).json({ 'result': 'Error eliminando el user' });;
  });
});

module.exports = router;
