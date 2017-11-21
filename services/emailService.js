var nodemailer = require('nodemailer');
var usersService = require('./usersService');
var hbs = require('nodemailer-express-handlebars');
var async = require('async')
var models = require('../models/');
var dateFormat = require('dateFormat');

var dinersModel = models.Diner;
var usersModel = models.User;



var options = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: 'views/email/',
    defaultLayout: 'template',
    partialsDir: 'views/partials/'
  },
  viewPath: 'views/email/',
  extName: '.hbs'
};

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemaunicodecomedores@gmail.com',
    pass: 'caeceteam'
  }
});

var sendRegistration = function (mailParams, callback) {
  var mailOptions = {
    from: 'suc@no-reply.com',
    to: mailParams.destination_email,
    subject: 'Solicitud de alta de comedor',
    template: 'registration',
    context: {
      user: mailParams.user_name,
      password: mailParams.password,
      url: mailParams.url
    }
  };
  sendMail(mailOptions, callback);
}

var sendNoValidatableRegistration = function (mailParams, callback) {
  var mailOptions = {
    from: 'suc@no-reply.com',
    to: mailParams.destination_email,
    subject: 'Gracias por sumarte a SUC',
    template: 'no_validatable_registration',
    context: {
      user: mailParams.user_name,
      password: mailParams.password,
      url: mailParams.url
    }
  };

  sendMail(mailOptions, callback);
}

var sendRegistrationApprovedMail = function (mailParams, callback) {
  var mailOptions = {
    from: 'suc@no-reply.com',
    to: mailParams.destination_email,
    subject: 'Estado de solicitud de alta de comedor',
    template: 'registration_approved',
    context: {
      user_name: mailParams.user_name,
      diner_name: mailParams.diner_name,
      url: mailParams.url
    }
  };

  sendMail(mailOptions, callback);
}

var sendRegistrationRejectedMail = function (mailParams, callback) {
  var mailOptions = {
    from: 'suc@no-reply.com',
    to: mailParams.destination_email,
    subject: 'Estado de solicitud de alta de comedor',
    template: 'registration_rejected',
    context: {
      diner_name: mailParams.diner_name,
      comment: mailParams.comment
    }
  };

  sendMail(mailOptions, callback);
}

var sendForgotPasswordMail = function (mailParams, callback) {

  var user = usersService.getUser(mailParams.user_name, function (err, result) {
    var mailOptions = {
      from: 'suc@no-reply.com',
      to: result.body.user.mail,
      subject: 'Blanqueo de contraseña',
      template: 'forgot_password',
      context: {
        user_name: mailParams.user_name,
        new_password: mailParams.new_password
      }
    };

    sendMail(mailOptions, callback);
  });


}

var sendDonationMailToDiner = function (mailParams, callback) {
  var userName = mailParams.user_name;
  var idDiner = mailParams.idDiner;

  async.auto({
    // this function will just be passed a callback
    findDiner: function (callback) {
      dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner) {
        callback(null, diner);
      }).catch(error => {
        callback({ 'body': { 'result': 'No se pudo enviar el mail de donacion' }, 'status': 404 }, null);
      });
    },
    findUser: function (callback) {
      usersModel.find({ where: { idUser: userName } }).then(function (user) {
        callback(null, user);
      }).catch(error => {
        callback({ 'body': { 'result': 'No se pudo enviar el mail de donacion' }, 'status': 404 }, null);
      });
    },
    sendMail: ['findDiner', 'findUser', function (results, callback) {
      var user = results.findUser;
      var diner = results.findDiner;
      var now = new Date();
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: diner.mail,
        subject: 'Has recibido una nueva donación',
        template: 'donation_send',
        context: {
          user_name: user.name + " " + user.surname,
          diner_name: diner.name,
          title: mailParams.title,
          description: mailParams.description,
          creation_date: dateFormat(now,"dd/mm/yyyy")
        }
      };

      callback(null, mailOptions);
    }]
  }, function (err, results) {
    if (!err) {
      sendMail(results.sendMail, callback);
    }
  });


  var user = usersService.getUser(mailParams.user_name, function (err, result) {
    var mailOptions = {
      from: 'suc@no-reply.com',
      to: result.body.user.mail,
      subject: 'Blanqueo de contraseña',
      template: 'forgot_password',
      context: {
        user_name: mailParams.user_name,
        new_password: mailParams.new_password
      }
    };

    sendMail(mailOptions, callback);
  });


}

var sendMail = function (mailOptions, callback) {
  transporter.use('compile', hbs(options));
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      callback({ "result": "error", "status": 500 });
    } else {
      console.log('Email sent: ' + info.response);
      callback({ "result": "ok", "status": 200 });
    }
  });
}

module.exports = {
  sendRegistration: sendRegistration,
  sendRegistrationApprovedMail: sendRegistrationApprovedMail,
  sendRegistrationRejectedMail: sendRegistrationRejectedMail,
  sendNoValidatableRegistration: sendNoValidatableRegistration,
  sendForgotPasswordMail: sendForgotPasswordMail,
  sendDonationMailToDiner: sendDonationMailToDiner
};
