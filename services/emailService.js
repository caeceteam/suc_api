var nodemailer = require('nodemailer');
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
             user : mailParams.user,
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
    sendRegistrationRejectedMail: sendRegistrationRejectedMail
};
