var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var https = require('https');
var request = require('request');
const { title } = require('process');
let serverurl = "https://tera-energy.github.io/Tera_Quaca_Common/server.json";



router.get('/', function (req, res, next) {
  request({
    url: serverurl,
  }, function (err, ress, html) {
    if (err) {
      console.log(err);
      return;
    }
    //console.log(html);
    const noticeJson = JSON.parse(html);
    var Url = noticeJson.customer.serverUrl;
    var hUrl = req.protocol + '://' + req.get('host');
    res.render('index', { title: '사용자용 페이지', Url: Url,hUrl:hUrl});
    console.log("헤로쿠url :" ,Url);
    console.log("현재url :" ,hUrl);
  });
});


module.exports = router;





