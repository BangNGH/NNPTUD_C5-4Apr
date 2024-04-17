var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

var app = express();
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  credentials: true // Cho phép sử dụng cookie
};

app.use(cors(corsOptions));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key', // Chuỗi bí mật để ký và mã hóa session ID
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: false, // Đặt true nếu sử dụng HTTPS
      maxAge: 3600000 // Thời gian sống của cookie, ví dụ: 1 giờ
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/TestC5').then(
  function () {
    console.log("connected");
  }
).catch(function (err) {
  console.log(err);
})

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    success: false,
    data: err.message
  });
});


module.exports = app;
