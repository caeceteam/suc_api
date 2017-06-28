var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken')

var index = require('./routes/index');
var users = require('./routes/users');
var authentication = require('./routes/authentication');
var inputTypes = require('./routes/inputTypes');
var foodTypes = require('./routes/foodTypes');
var diners = require('./routes/diners');
var dinerInputs = require('./routes/dinerInputs');



var app = express();
var apiRoutes = express.Router();
app.set('jwtTokenSecret', 'sucapi-2017_');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {


  if (shouldAvoidTokenValidation(req)){
    next();
  } else {
    validateToken(req, res, next);
  }
});

var shouldAvoidTokenValidation = function(req){
  return req.method == "POST" && req.url.includes("users") || req.url.includes("diners")
}

var validateToken = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('jwtTokenSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
}

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

app.use('/', index);
app.use('/authentication', authentication);
app.use('/api/users', users);
app.use('/api/inputTypes', inputTypes);
app.use('/api/foodTypes', foodTypes);
app.use('/api/diners', diners);
app.use('/api/dinerInputs', dinerInputs);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
