var nodemailer = require('nodemailer');
var usersService = require('./usersService');
var hbs = require('nodemailer-express-handlebars');
var async = require('async')
var models = require('../models/');
var dateFormat = require('dateformat');

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
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      type: 'OAuth2',
      user: 'sistemaunicodecomedores@gmail.com',
      clientId: '29204936892-t2o7pnb6tvn8u2nppi3edjhgpjrmsl6s.apps.googleusercontent.com',
      clientSecret: 'blUaU8KMsbakFB7XKWHFZmcs',
      refreshToken: '1/BRAMjs6ZEjDLpGiqg0kUxc_zwtylHxIovlgWkzsaj--OVBP7mcnifhfzvcKksMnI',
      accessToken: 'ya29.GlsQBa3Zuyk2w-eB3yvVrUIG-ouumF7J0rcxjZ10QD98zRf8JzGB0PGwRY5qjzdAri4cjSfKNZE_ZAZsTrGrM-6-pCTg_IPmql-V5a6dV1Rjt4kr5UvZfJMYxCwj',
      expires: 1484314697598
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

var sendEventNotification = function (mailParams, callback) {
  var idDiner = mailParams.diner_id;
  var idUser = mailParams.user_id;
  async.auto({
    // this function will just be passed a callback
    findDiner: function (callback) {
      dinersModel.find({ where: { idDiner: idDiner } }).then(function (diner) {
        callback(null, diner);
      }).catch(error => {
        callback({ 'body': { 'result': 'No se pudo enviar el mail de notificacion' }, 'status': 404 }, null);
      });
    },
    findUser: function (callback) {
      usersModel.find({ where: { idUser: idUser } }).then(function (user) {
        callback(null, user);
      }).catch(error => {
        callback({ 'body': { 'result': 'No se pudo enviar el mail de notificacion' }, 'status': 404 }, null);
      });
    },
    sendMail: ['findDiner', 'findUser', function (results, callback) {
      var diner = results.findDiner;
      var user = results.findUser;
      var now = new Date();
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: user.mail,
        subject: diner.name + ' va a estar realizando un evento proximamente',
        template: 'event_notification',
        context: {
          event_name: mailParams.event_name,
          diner_name: diner.name,
          phone: diner.phone,
          event_date: dateFormat(now, "dd/mm/yyyy"),
          event_time: dateFormat(now, "HH:MM"),
          event_address: mailParams.event_address
        }
      };

      callback(null, mailOptions);
    }]
  }, function (err, results) {
    if (!err) {
      sendMail(results.sendMail, callback);
    }
  });
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
          creation_date: dateFormat(now, "dd/mm/yyyy")
        }
      };

      callback(null, mailOptions);
    }]
  }, function (err, results) {
    if (!err) {
      sendMail(results.sendMail, callback);
    }
  });
}


var sendDonationUpdateMailToUser = function (mailParams, callback) {
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
      var statusText = mailParams.statusText;
      var now = new Date();
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: user.mail,
        subject: 'Tu donación ha sido ' + statusText,
        template: 'donation_update',
        context: {
          user_name: user.name + " " + user.surname,
          diner_name: diner.name,
          title: mailParams.title,
          description: mailParams.description,
          creation_date: dateFormat(now, "dd/mm/yyyy"),
          status_text: statusText
        }
      };

      callback(null, mailOptions);
    }]
  }, function (err, results) {
    if (!err) {
      sendMail(results.sendMail, callback);
    }
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
  sendDonationMailToDiner: sendDonationMailToDiner,
  sendEventNotification: sendEventNotification,
  sendDonationUpdateMailToUser: sendDonationUpdateMailToUser
};
