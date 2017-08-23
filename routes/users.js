var express = require('express');
var router = express.Router();
var app = express();
var usersService = require('../services/usersService')

/* GET users listing. */
router.get('/:user?', function (req, res, next) {
  var searchParam = req.params.user;
  if (searchParam) {
    usersService.getUser(searchParam, function (err, result) {
      if (!err) {
        res.status(result.status).json(result.body);
      } else {
        res.status(err.status).json(err.body);
      }
    });
  } else {
    usersService.getAllUsers(req, function (err, result) {
      if (!err) {
        res.status(result.status).json(result.body);
      } else {
        res.status(err.status).json(err.body);
      }
    });
  }
});

/* POST de user. */
router.post('/', function (req, res, next) {
  var userRequest = req.body;
  usersService.createUser(userRequest, function (err, result) {
    if (!err) {
      res.status(result.status).json(result.body);
    } else {
      res.status(err.status).json(err.body);
    }
  });
});

router.put('/:searchParam', function (req, res, next) {
  var searchParam = req.params.searchParam;
  usersService.updateUser(searchParam, req.body, function (err, result) {
    if (!err) {
      res.status(result.status).json(result.body);
    } else {
      res.status(err.status).json(err.body);
    }
  });
});

router.delete('/:user', function (req, res, next) {
  var searchParam = req.params.user;
    usersService.deleteUser(searchParam, function (err, result) {
        if (!err) {
            res.status(result.status).json(result.body);
        } else {
            res.status(err.status).json(err.body);
        }
    });
});

module.exports = router;
