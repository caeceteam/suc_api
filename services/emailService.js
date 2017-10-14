var nodemailer = require('nodemailer');
var usersService = require('./usersService');
var hbs = require('nodemailer-express-handlebars');

var options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'views/email/',
        defaultLayout : 'template',
        partialsDir : 'views/partials/'
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

  var sendRegistration = function(mailParams){
    
      
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: mailParams.destination_email,
        subject: 'Solicitud de alta de comedor',
        template: 'registration',
        context: {
             user : mailParams.user_name,
             password : mailParams.password,
             url: mailParams.url
        }
      };
      sendMail(mailOptions);
      
}

var sendNoValidatableRegistration = function(mailParams){
  
    console.log(mailParams);
    var mailOptions = {
      from: 'suc@no-reply.com',
      to: mailParams.destination_email,
      subject: 'Gracias por sumarte a SUC',
      template: 'no_validatable_registration',
      context: {
           user : mailParams.user_name,
           password : mailParams.password,
           url: mailParams.url
      }
    };
    sendMail(mailOptions);
    
}

var sendRegistrationApprovedMail = function(mailParams){
    
      
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: mailParams.destination_email,
        subject: 'Estado de solicitud de alta de comedor',
        template: 'registration_approved',
        context: {
             user_name : mailParams.user_name,
             diner_name : mailParams.diner_name,
             url: mailParams.url
        }
      };
      
      sendMail(mailOptions);
}

var sendRegistrationRejectedMail = function(mailParams){
      
      var mailOptions = {
        from: 'suc@no-reply.com',
        to: mailParams.destination_email,
        subject: 'Estado de solicitud de alta de comedor',
        template: 'registration_rejected',
        context: {
             diner_name : mailParams.diner_name,
             comment: mailParams.comment
        }
      };
      
      sendMail(mailOptions);
}

var sendForgotPasswordMail = function(mailParams){

  var user = usersService.getUser(mailParams.user_name, function(err, result){
    var mailOptions = {
      from: 'suc@no-reply.com',
      to: result.body.mail,
      subject: 'Blanqueo de contraseña',
      template: 'forgot_password',
      context: {
           user_name : mailParams.user_name,
           new_password: mailParams.new_password
      }
    };
    
    sendMail(mailOptions);
  });
  
  
}

var sendMail = function(mailOptions){
  transporter.use('compile', hbs(options));
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
    sendRegistration: sendRegistration,
    sendRegistrationApprovedMail: sendRegistrationApprovedMail,
    sendRegistrationRejectedMail: sendRegistrationRejectedMail,
    sendNoValidatableRegistration:sendNoValidatableRegistration,
    sendForgotPasswordMail: sendForgotPasswordMail
};
