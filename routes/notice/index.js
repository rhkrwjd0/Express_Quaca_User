var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');
var url = require('../components/mongodb').url;
var conn = require('../components/mariaDB');
var { noticeselect, FAQ, AskList, AskInsert, NoticeList, NoticeInfo} = require('../function/notice');
// 첫화면 공지사항 팝업
router.post('/notice', function (req, res) {
    let StoreId = req.body.StoreId;
    var d = new Date();
    let NowDate = moment(d).format('YYYY-MM-DD HH:mm:ss');

    noticeselect(StoreId,NowDate)
    .then((resnoticeInfo) => {
        if ((resnoticeInfo.code == 0) && (resnoticeInfo.rows > 0)) {
            res.json({ success: true, info: resnoticeInfo.info});
            console.log("res notice Select 성공 -", Date());
          }else if((resnoticeInfo.code == 0) && (resnoticeInfo.rows == 0)){
            res.json({ success: false,  msg: null, });
            console.log("res notice 데이터 값 없음 -", Date());
          } else {
            res.json({ success:false,  msg: resnoticeInfo.msg });
            console.log("res notice Select 실패 -", Date());
          }
    })
    .catch((error)=>{
        res.json({  success:false ,msg: "error" });
        console.log("res notice Select catch - notice Select 실패 :", error, " - ", Date());
    })
});
// 자주하는 질문(사용자) or FAQ(관리자)
router.post('/FAQ', function (req, res) {
  let StoreId = req.body.StoreId;
  FAQ(StoreId)
  .then((resFAQ) => {
    if (resFAQ.code == 0) {
      res.json({ success: true, info: resFAQ.info });
      console.log("Mongo quickInfo 성공 -", Date());
    }else if(resFAQ.code == 0){
      res.json({ success: false,  msg: resFAQ.msg});
      console.log("Mongo quickInfo 데이터 값 없음 -", Date());
    } else {
      res.json({ success: false, msg: resFAQ.msg });
      console.log("Mongo quickInfo 실패 -", Date());
    }
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res FAQ Select catch - FAQ Select 실패 :", error, " - ", Date());
  })
});
// 1:1문의 내역(사용자) or 고객센터(관리자) 목록
router.post('/AskList', function (req, res) {
  let StoreId = req.body.StoreId;
  let SsoKey = req.body.SsoKey;
  AskList(StoreId, SsoKey)
  .then((resAskList) => {
    if (resAskList.code == 0) {
      res.json({ success: true, info: resAskList.info });
      console.log("resAskList  성공 -", Date());
    }else{
      res.json({ success: false, msg: resAskList.msg });
      console.log("resAskList  실패 -", Date());
    }
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resAskList Select catch - resAskList Select 실패 :", error, " - ", Date());
  })
});

// 1:1문의 내역(사용자) or 고객센터(관리자) 등록
router.post('/AskInsert', function (req, res) {
  let StoreId = req.body.StoreId;
  let SsoKey = req.body.SsoKey;
  let InsertNm = req.body.InsertNm;
  let Title = req.body.Title;
  let Contents = req.body.Contents;
  AskInsert(StoreId, SsoKey, InsertNm, Title, Contents)
  .then((resAskInsert) => {
    if (resAskInsert.code == 0) {
      res.json({ success: true });
      console.log("resAskInsert  성공 -", Date());
    }else {
      res.json({ success: false, msg: resAskInsert.msg });
      console.log("resAskInsert  실패 -", Date());
    }
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resAskInsert catch - [실패] :", error, " - ", Date());
  })
});

// 공지사항(사용자) or 공지사항(관리자) 
router.post('/NoticeList', function (req, res) {
  let StoreId = req.body.StoreId;
  NoticeList(StoreId)
  .then((resNoticeList) => {
    res.json({ success: true, info: resNoticeList.info });
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resNotice Select catch - resNotice Select 실패 :", error, " - ", Date());
  })
});

// 공지사항(사용자) or 공지사항(관리자) 디테일 정보
router.post('/NoticeInfo', function (req, res) {
  let StoreId = req.body.StoreId;
  let Sid = req.body.Sid;
  NoticeInfo(StoreId, Sid)
  .then((resNoticeList) => {
    res.json({ success: true, info: resNoticeList.info });
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resNotice Select catch - resNotice Select 실패 :", error, " - ", Date());
  })
});

module.exports = router;






// router.get('/', function (req, res, next) {
//     console.log("111111111111111");
//     res.render('mongo',{UserName:' ',MenuName:' ' ,Count:' ', Price:' ', date: ' ', UserId:' '});
// });

// router.get('/order', function (req, res) {
//     console.log(url);
//     let UserName = req.query.UserName;
//     MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
//         console.log("Connected successfully to server");
//         db = client.db('notice');
//         console.log(UserName);
//         db.collection('notice').find().toArray(function(err,doc){
//             if(err) return res.status(500).json({error: err});
//             if(!doc) return res.status(404).json({error: 'UserName not found'});
//             res.json(doc); 
//             console.log("데이터 조회 !");
//             client.close();
//             });
//     });
// });


// router.get('/search', function (req, res) {
//     let UserId = req.query.UserId;
//     console.log(UserId);
//     MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
//         console.log("Connected successfully to server");   
//         var db = client.db('notice');
//         var id = mongoose.Types.ObjectId(UserId);
//         var myquery = {_id : id};
//         console.log(myquery);
//         db.collection('notice').findOne(myquery,function(err,doc){
//         var data = JSON.stringify(doc);
//         if(err) return res.status(500).json({error: err});
//         if(!doc) return res.status(404).json({error: 'UserId not found'});
//         res.render('mongo',{UserName:doc.UserName, MenuName:doc.MenuName, Count:doc.count, Price:doc.Price, date:doc.date, UserId:doc._id });
//         console.log("데이터 조회 !");
//     });
// });
// });

// router.get('/insert', function (req, res) {
//     let UserName = req.query.UserName;
//     let MenuName = req.query.MenuName;
//     let Count = req.query.Count;
//     let Price = req.query.Price;
//     var date = moment().format('YYYY-MM-DD HH:mm:ss');
//     console.log(UserName,MenuName,Count, Price,date );
//     console.log(url);
//     MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
//         console.log("Connected successfully to server");
//         var db = client.db('notice');
//         db.collection('notice')
//         .insertOne({
//             "UserName" : UserName,
//             "MenuName" : MenuName,
//             "count" : Count,
//             "Price" : Price,
//             "date" : date
//         });
//         console.log("데이터 추가 !");
//     });
// });

// router.get('/update', function (req, res) {
//     var UserId = req.query.UserId;
//     let UserName = req.query.UserName;
//     let MenuName = req.query.MenuName;
//     let Count = req.query.Count;
//     let Price = req.query.Price;
//     var date = moment().format('YYYY-MM-DD HH:mm:ss');
//     console.log(UserId,UserName,MenuName,Count, Price,date );
    
//     MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
//         console.log("Connected successfully to server");
//         if (err) throw err;
//         var db = client.db('notice');
//         var id = mongoose.Types.ObjectId(UserId);
//         var myquery = {_id : id};
//         var newvalues = { $set: {UserId:UserId, UserName:UserName,MenuName:MenuName, count:Count, Price:Price, date:date} };
//         db.collection('notice').updateOne(myquery, newvalues, function(err,res){
//             if (err) throw err;
//             console.log("1 document updated");
//             client.close();
//         });
//     }); 
// });

// router.get('/delete', function (req, res) {
//     var UserId = req.query.UserId;

//     MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
//         console.log("Connected successfully to server");
//         if (err) throw err;
//         var db = client.db('notice');
//         var id = mongoose.Types.ObjectId(UserId);
//         var myquery = {_id : id};
//         db.collection('notice').deleteOne(myquery, function(err,res){
//             if (err) throw err;
//             console.log("1 document delete");
//             client.close();
//         });
//     }); 
// });
// router.get('/home', function (req, res) {
//     res.render('index',{title:"User",hUrl:' ', Url:' ' });
// });
