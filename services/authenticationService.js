var express = require('express');
var jwt = require('jwt-simple')
var models = require('../models/');
var app = express();
var moment = require('moment');
var expires = moment().add(7, 'days').valueOf();
var async = require('async');

const crypto = require('crypto');
app.set('jwtTokenSecret', 'sucapi-2017_');
var usersService = require('./usersService');

var dinersModel = models.Diner;
var usersModel = models.User;
var usersDinersModel = models.UserDiner;
dinersModel.belongsToMany(usersModel, { through: usersDinersModel, foreignKey: 'idDiner' });
usersModel.belongsToMany(dinersModel, { through: usersDinersModel, foreignKey: 'idUser' });

var authenticate = function (credentials, responseCB) {
    var userName = credentials.userName;
    var password = credentials.password;
    var hash = crypto.createHash('sha256');

    async.auto({
        // this function will just be passed a callback
        findUser: function (callback) {
            usersService.getUser(userName, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        validatePassword: ['findUser', function (results, cb) {
            var user = results.findUser;
            var hashedPass = hash.update(password).digest("base64");
            if (user.pass !== hashedPass) {
                // incorrect password
                cb({ 'body': { 'result': "La contraseña ingresada es invalida" }, 'status': 401 }, null);
            } else {
                cb(null, user);
            }
        }],
        findDiners: ['validatePassword', function (results, cb) {
            var user = results.findUser;
            user.getDiners().then(function(diners){
                cb(null, diners);
            }).catch(error => {
                cb({ 'body': { 'result': "Error en conseguir comedores del user" }, 'status': 500 }, null);
            });
        }],
        generateToken: ['findDiners', function (results, callback) {
            var user = results.validatePassword;
            try {
                var token = jwt.encode({
                    iss: user.idUser,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                callback(null, { 'body': { 'token': token, 'diners': results.findDiners }, 'status': 200 });
            } catch (exception) {
                callback({ 'body': { 'result': "Error generando token" }, 'status': 500 }, null);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.generateToken);
        } else {
            responseCB(err, null);
        }
    });
}

var updatePassword = function (credentials, newPassword, responseCB) {
    var userName = credentials.userName;
    var password = credentials.password;
    var oldHash = crypto.createHash('sha256');
    var newHash = crypto.createHash('sha256');

    async.auto({
        // this function will just be passed a callback
        findUser: function (callback) {
            usersService.getUser(userName, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        validatePassword: ['findUser', function (results, cb) {
            var user = results.findUser;
            var hashedPass = oldHash.update(password).digest("base64");
            if (user.pass !== hashedPass) {
                // incorrect password
                cb({ 'body': { 'result': "La contraseña ingresada es invalida" }, 'status': 401 }, null);
            } else {

                cb(null, user);
            }
        }],
        updatePassword: ['validatePassword', function (result, callback) {
            var user = result.validatePassword;
            try {
                user.pass = newHash.update(newPassword).digest("base64");
                user.save();
                callback(null, user);
            } catch (exception) {
                callback({ 'body': { 'result': "Error actualizando password" }, 'status': 500 }, null);
            }
        }],
        generateToken: ['updatePassword', function (result, callback) {
            var user = result.updatePassword;
            try {
                var token = jwt.encode({
                    iss: user.idUser,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                callback(null, { 'body': { 'token': token }, 'status': 200 });
            } catch (exception) {
                callback({ 'body': { 'result': "Error generando token" }, 'status': 500 }, null);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.generateToken);
        } else {
            responseCB(err, null);
        }
    });
}


module.exports = {
    authenticate: authenticate,
    updatePassword: updatePassword
};