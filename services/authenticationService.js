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
var emailService = require('./emailService');

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
            var user = results.findUser.user;
            var hashedPass = hash.update(user.alias+password).digest("base64");
            if (user.pass !== hashedPass) {
                // incorrect password
                cb({ 'body': { 'result': "La contraseña ingresada es invalida" }, 'status': 401 }, null);
            } else {
                cb(null, results.findUser);
            }
        }],
        generateToken: ['validatePassword', function (results, callback) {
            var userAndDiner = results.validatePassword;
            var user = userAndDiner.user;
            try {
                var token = jwt.encode({
                    iss: user.idUser,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                callback(null, { 'body': { 'token': token, 'user':user , 'diners': userAndDiner.diners }, 'status': 200 });
            } catch (exception) {
                console.log(exception);
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
            var user = results.findUser.user;
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
                user.pass = newHash.update(user.alias + newPassword).digest("base64");
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

var cleanPassword = function (credentials, responseCB) {
    var userName = credentials.userName;
    var newPassword = generateRandomPass(8);
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
        updatePassword: ['findUser', function (result, callback) {
            var user = result.findUser.user;
            try {
                user.pass = newHash.update(newPassword).digest("base64");
                user.save();
                callback(null, user);
            } catch (exception) {
                callback({ 'body': { 'result': "Error actualizando password" }, 'status': 500 }, null);
            }
        }],
        sendMail: ['updatePassword', function(result, callback){
            emailService.sendForgotPasswordMail({user_name: userName, new_password:newPassword});
            callback(null, null);
        }],
        generateToken: ['updatePassword', function (result, callback) {
            var user = result.updatePassword;
            try {
                var token = jwt.encode({
                    iss: user.idUser,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                callback(null, { 'body': { 'token': token, 'user': user }, 'status': 200 });
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

function generateRandomPass(length){
    return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') // convert to hexadecimal format
    .slice(0,length);
}


module.exports = {
    authenticate: authenticate,
    updatePassword: updatePassword,
    cleanPassword:cleanPassword
};