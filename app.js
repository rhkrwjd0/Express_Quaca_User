var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');

var indexRouter = require('./routes/index'); //사용자
var usersRouter = require('./routes/sign_up/index.js'); //사용자
var ordersRouter = require('./routes/order/index.js'); //주문
var storeRouter = require('./routes/store/index.js'); //매장
var noticeRouter = require('./routes/notice/index.js'); //쿼카 몽고db 테스트
var menuRouter = require('./routes/menu/index.js');  //메뉴
var geoRouter = require('./routes/geo/index.js');  //위치
var rewardRouter = require('./routes/reward/index.js');  //리워드

//var userInfoRouter = require('./routes/userInfo/index.js');// 회원 정보(마리아)


var cors = require('cors');
var app = express();

// CORS 설정
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); //사용자
app.use('/users', usersRouter); //사용자-
app.use('/orders', ordersRouter); //주문서
app.use('/store',storeRouter); //매장
app.use('/notice',noticeRouter);  //쿼카 몽고db 테스트
app.use('/menu',menuRouter); //메뉴
app.use('/geo',geoRouter); //위치
app.use('/reward',rewardRouter); //리워드

//app.use('/userInfo', userInfoRouter); //회원정보 마리아
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;