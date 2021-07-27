var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');


//QU_007 - 결제내역 (SearchType = [0 - 기간 , 1 - 1개월, 3 - 3개월 ])
var UserPaySelectInfo = (StoreId, SsoKey, SearchType, StartDt, EndDt) =>{
  return new Promise((resolve, reject) => {
    let selectData = [StoreId, SsoKey, SearchType , StartDt, SearchType , SearchType , EndDt];
    let selectSql = 'SELECT '
                      +'up.StoreId, up.UserPayId, DATE_FORMAT(up.PayCompleteTime, "%Y-%m-%d %H:%i") AS PayCompleteTime, up.TotalPrice, '
                      +'(CASE '
                        +'WHEN up.OrderStatus = "OC" THEN "접수대기" '
                        +'WHEN up.OrderStatus = "RC" THEN "접수완료" '
                        +'WHEN up.OrderStatus = "PC" THEN "제조완료" '
                        +'WHEN up.OrderStatus = "PUC" THEN "픽업완료" '
                        +'WHEN up.OrderStatus = "CP" THEN "주문취소대기" '
                        +'WHEN up.OrderStatus = "CUP" THEN "주문취소완료" '
                      +'END) AS OrderStatus, '
                      +'upd.ja AS MenuList '
                      +'FROM UserPay up '
                      +'LEFT JOIN ( '
                      +'SELECT Detail.UserPayId AS UserPayId ,JSON_ARRAYAGG(Detail.DetailJo) AS ja '
                      +'FROM ( '
                        +'SELECT '
                          +'jo.UserPayId AS UserPayId, '
                          +'JSON_OBJECT("OrderNum", SUBSTRING(jo.UserPayDid,9,3), "UserPayDid", jo.UserPayDid, "UserPayId", jo.UserPayId, "OrderCnt", jo.OrderCnt, "MenuName", jo.MenuName, '
                          +'"Price", jo.Price, "OptionA", jo.OptionA, "OptionB", jo.OptionB, "OptionC",jo.OptionC) AS DetailJo '
                          +'FROM UserPayDetail AS jo '
                      +') AS Detail '
                      +'GROUP BY Detail.UserPayId '
                    +') upd ON up.UserPayId = upd.UserPayId '
                    +'WHERE up.StoreId = ? '
                    +'AND up.SsoKey = ? '
                    +'AND DATE_FORMAT(up.InsertDt,"%Y-%m-%d") '
                      +'BETWEEN (CASE '
                        +'WHEN ? = "term" THEN DATE_FORMAT( ? ,"%Y-%m-%d") '
                        +'WHEN ? = "month" THEN DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 MONTH),"%Y-%m-%d") '
                        +'ELSE DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 WEEK),"%Y-%m-%d") '
                      +'END) '
                      +'AND (CASE '
                        +'WHEN ? = "term" THEN DATE_FORMAT( ? ,"%Y-%m-%d") '
                        +'ELSE DATE_FORMAT(NOW(),"%Y-%m-%d") '
                      +'END) '
                    +'ORDER BY up.InsertDt DESC ' ;
    let sql = require('mysql').format(selectSql , selectData);  
    conn.connection.query(sql, function (error, rows, fields) {
        if (error) {
            console.log("UserPay select error - ", Date());
            console.log("errno > " + error.errno);
            console.log("sqlMessage > " + error.sqlMessage);
            reject({ code: error.errno, msg: error.sqlMessage });
          } else {
            console.log("UserPay select success - ", Date());
            resolve({ code: 0, info:rows, rows:rows.length });
          }  
    });
  });
}
//QU_008 - 결제상세내역
var UserPayDetailSelectInfo = (UserPayId) =>{
  return new Promise((resolve, reject) => {
      let DetailUserPayId = [UserPayId];
      console.log('UserPayDetail select 데이터 >',  DetailUserPayId);
      let selectSql = 'SELECT '
                        +'up.StoreId, up.UserPayId, up.TotalPrice, up.OrderStatus, '
                        +'DATE_FORMAT(up.PayCompleteTime, "%Y-%m-%d %H:%i") AS PayCompleteTime, '
                        +'DATE_FORMAT(up.MenuCompleteTime, "%Y-%m-%d %H:%i") AS MenuCompleteTime, '
                        +'upd.ja AS MenuList '
                      +'FROM UserPay up '
                      +'LEFT JOIN ( '
                        +'SELECT '
                          +'Detail.UserPayId AS UserPayId ,JSON_ARRAYAGG(Detail.DetailJo) AS ja '
                        +'FROM ( '
                          +'SELECT '
                            +'jo.UserPayId AS UserPayId, '
                            +'JSON_OBJECT("UserPayDid", jo.UserPayDid, "UserPayId", jo.UserPayId, "OrderCnt", jo.OrderCnt, "OrderNum", SUBSTRING(jo.UserPayDid,9,3), '
                            +'"MenuName", jo.MenuName, "MenuId", jo.MenuId, "Price", jo.Price, "PayMethod", jo.PayMethod, '
                            +'"OptionA", jo.OptionA, "OptionB", jo.OptionB, "OptionC", jo.OptionC) AS DetailJo '
                          +'FROM UserPayDetail AS jo '
                        +') AS Detail '
                        +'GROUP BY Detail.UserPayId '
                      +') upd ON up.UserPayId = upd.UserPayId '
                      +'WHERE up.UserPayId = ? '
      let sql = require('mysql').format(selectSql , DetailUserPayId);  
      conn.connection.query(sql, function (error, rows, fields) {
          if (error) {
              console.log("UserPayDetail select error - ", Date());
              console.log("errno > " + error.errno);
              console.log("sqlMessage > " + error.sqlMessage);
              reject({ code: error.errno, msg: error.sqlMessage });
            } else {
              console.log("UserPayDetail select success - ", Date());
              if (!error && rows.length > 0) {
                resolve({ success: true,code: 0, info: rows[0] });
              } else if (!error && rows.length == 0) {
                resolve({ success: false, msg: error });
              } else {
                resolve({ success: false, msg: error });
              }
            }  
      });
  });
}



//QU_011 - 마리아DB UserPayDetail Insert
var mariaInsertPayDetail = (UserPayId,StoreId,PayMethod,OrderCnt,DetailMenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT) => {
    let DetailInsertData = [UserPayId,StoreId,PayMethod,OrderCnt,DetailMenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT];
    return new Promise((resolve, reject) => {
        console.log("4.1 mairaDB UserPayDetail테이블 insert데이터 > ",DetailInsertData);
        var sql = 'INSERT INTO UserPayDetail(UserPayDid,UserPayId,StoreId,PayMethod,OrderCnt,MenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT) select(SELECT concat(date_format(NOW(),"%Y%m%d"),LPAD((SELECT COUNT(*)+1 FROM UserPayDetail WHERE SUBSTR(UserPayDid,1,8)=date_format(NOW(),"%Y%m%d")),3,"0")) AS UserPayDid FROM DUAL),?,?,?,?,?,?,?,?,?,?,?,?,?,?,? FROM DUAL';
        var params = [UserPayId,StoreId,PayMethod,OrderCnt,DetailMenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT];
        conn.connection.query(sql, params, function (error, rows, fields) {
            if (error) {
                console.log("UserPayDetail Insert error - ", Date());
                console.log("sqlMessage > " + error);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("UserPayDetail Insert success - ", Date());
              }   
            });
        });
}

//QU_011 - 마리아DB UserPay Insert
var mariaInsertPay = (UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT) => {
    console.log("3.0.1");
    let UserPayinsertData = [UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT];
    return new Promise((resolve, reject) => {
        console.log("3.1 mairaDB UserPay테이블 insert데이터 > ",UserPayinsertData);
        var sql = 'INSERT INTO UserPay(UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        var params = [UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT];
        conn.connection.query(sql, params, function (error, rows, fields) {
            if (error) {
                console.log("UserPay Insert error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("UserPay Insert success - ", Date());

                resolve({ code: 0 });
              }   
            });
        });
    }
//QU_011 - MongoDB에 import에서 넘어온 데이터 저장
var MongoInsertPayInfo = (MStoreId,MongoUserPayId,MongoUserPayDid,MongoOrderNum,MongoInsertDt,MongoNickName,MongoMenuName,MongoPrice,MongoOrderCnt,MongoOrderCntDetail,MongoOrderStatus,MongoOptionA,MongoOptionB,MongoOptionC,MongorealCount,paymentData) =>{
    let insertData = [MStoreId,MongoUserPayId,MongoUserPayDid,MongoOrderNum,MongoInsertDt,MongoNickName,MongoMenuName,MongoPrice,MongoOrderCnt,MongoOrderCntDetail,MongoOrderStatus,MongoOptionA,MongoOptionB,MongoOptionC,MongorealCount];
    return new Promise((resolve,reject)=> {
        console.log("Mongo UserPayId INSERT data > ", insertData);
        MongoClient.connect(url, { useUnifiedTopology: true }, function (error, client) {
            if(error){
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                console.log("Mongo Connected successfully to server");
                var db = client.db('Quaca');
                db.collection('Quaca')
                .insertOne({
                    "UserPayId" : MongoUserPayId,
                    "StoreId" : MStoreId,
                    "realCount" : MongorealCount,
                    "UserPayDid" : MongoUserPayDid,
                    "OrderNum" : MongoOrderNum,
                    "InsertDT" : MongoInsertDt,
                    "NickName": MongoNickName,
                    "MenuName": MongoMenuName,
                    "Price": MongoPrice,
                    "OrderCnt": MongoOrderCnt,
                    "OrderCntDetail":MongoOrderCntDetail,
                    "OrderStatus":MongoOrderStatus,
                    "OptionA":MongoOptionA,
                    "OptionB":MongoOptionB,
                    "OptionC":MongoOptionC,
                    "detail":
                        {
                            paymentData
                        }
                });
                console.log("Mongo데이터 추가 !");
                resolve({ code: 0});
            }
        });
    });
};

////QU_011_1 - import결제정보 조회
var MongoSelectPayInfo = (UserPayId) =>{
    let selectData = UserPayId;
    return new Promise((resolve,reject)=> {
        console.log("Mongo UserPayId selectData data > ", selectData);
        MongoClient.connect(url, { useUnifiedTopology: true }, function (error, client) {
            if(error){
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                console.log("Connected successfully to server");   
                var db = client.db('Quaca');
                var query = {UserPayId : UserPayId};
                console.log(query);
                // db.collection('Quaca').findOne(query,function(err,doc){
                //     console.log("데이터 조회 !",doc);
                //     resolve({ code: 0, err:err, info:doc});
                // });
                db.collection('Quaca').find(query).toArray(function(err,doc){
                  if(err){
                    console.log("데이터 에러 > ",err);
                  }else{
                    console.log("데이터 조회 > ",doc);
                    resolve({ code: 0, err:err, info:doc});
                  }
                  
              });
            }
        });
    });
}
//몽고 오늘날짜 주문횟수 조회
var MongoTodayCount = (MongoTime) =>{
  let selectData = MongoTime;
  return new Promise((resolve,reject)=> {
      console.log("Mongo count Date > ", selectData);
      MongoClient.connect(url, { useUnifiedTopology: true }, function (error, client) {
          if(error){
              console.log("errno > " + error);
              reject({ code: error, msg: error });
          }else{
              console.log("Connected successfully to server");   
              var db = client.db('Quaca');
              var query = {UserPayId : UserPayId};
              console.log(query);
              db.collection('Quaca').findOne(query,function(err,doc){
                  console.log("데이터 조회 !",doc);
                  resolve({ code: 0, err:err, info:doc});
              });
          }
      });
  });
}
//QU_016 퀵오더조회
var quickInfo = (SsoKey,StoreId) =>{
    let selectData = [SsoKey,StoreId];
    return new Promise((resolve, reject) => {
        console.log('selectData데이터 >',  selectData);
        var selectSql = 'SELECT q.*, c.ImgUrl '
            + ' FROM ('
            + '  SELECT a.UserPayId, b.UserPayDid,b.MenuName,b.MenuId,b.OrderCnt,b.Price,b.OptionA,b.OptionB,b.OptionC,date_format(b.InsertDt, "%Y-%m-%d %H:%i:%s") as InsertDt '
            + ' FROM UserPay a, UserPayDetail b WHERE  a.UserPayId = b.UserPayId  and a.SsoKey =  '
            +'"'+SsoKey+'"'+' and a.StoreId = ' + '"'+StoreId+'"' 
            +' GROUP BY b.UserPayDid ORDER BY InsertDt DESC LIMIT 3'
            +' ) AS q LEFT JOIN Menu c '
            +' ON c.MenuId = q.MenuId '
            +' WHERE c.storeid = ' +'"'+StoreId+'"'+' Order By q.InsertDt desc';	
        conn.connection.query(selectSql, function (error, rows, fields) {
            if (error) {
                console.log("selectData select error - ", Date());
                console.log("errno > " + error);
                reject({msg: error });
              } else {
                if (!error && rows.length > 0) {                
                    resolve({ success: true, info:rows,code:0});
                  } else if (!error && rows.length == 0) {
                    resolve({ success: false, msg: null ,code:1});
                  } else {
                    resolve({ success: false, msg: error,code:2 });
                  }
              }  
        });
    });
}
//QU_018 결제취소요청
var CanclePay = (UserPayId) =>{
    let selectData = [UserPayId];
    var d = new Date();
    let CancleTime = moment(d).format('YYYY-MM-DD HH:mm:ss');
    return new Promise((resolve, reject) => {
        console.log('CanclePay 데이터 >',  selectData);
        var sql = 'Update UserPay set OrderStatus = "CP",CancleTime= ? where UserPayId = ?';
        var params = [CancleTime,UserPayId];
        conn.connection.query(sql, params, function (error, rows, fields) {
            if (error) {
                console.log("selectData select error - ", Date());
                console.log("errno > " + error);
                reject({msg: error });
              }else {
                var sql = 'Update UserPayDetail set OrderStatus = "CP",CancleTime= ? where UserPayId = ?';
                var params = [CancleTime,UserPayId];
                conn.connection.query(sql, params, function (error, rows, fields) {
                    if (error) {
                        console.log("selectData select error - ", Date());
                        console.log("errno > " + error);
                        reject({msg: error });
                      }else {
                        var sql = 'select UserPayId, OrderStatus,date_format(CancleTime, "%Y-%m-%d %H:%i:%s") as CancleTime ,date_format(InsertDt, "%Y-%m-%d %H:%i:%s") as InsertDt from UserPay where UserPayId = '
                        +"'"+UserPayId+"'"+' Order By CancleTime desc;';
                        conn.connection.query(sql, function (error, rows, fields) {
                            if (!error && rows.length > 0) {                
                                resolve({ success: true, info:rows[0],code:0});
                              } else if (!error && rows.length == 0) {
                                resolve({ success: false, msg: null ,code:1});
                              } else {
                                resolve({ success: false, msg: error,code:2 });
                              }
                        });    
                      }
                });
              }  
        });
    });
}
                
  //UserPayDetail 결제 상세내역 조회(mongo insert용)
var OrderNumberCount = (MStoreId,MUserPayId) =>{
  let StoreIddata = [MStoreId,MUserPayId];
  console.log('결제 상세내역 조회 DATA > ',StoreIddata);
  return new Promise((resolve, reject) => {
      //mongodb에 넣을 realcount 여기에서 insert 해줌
      var selectSql = 'SELECT a.UserPayId AS UserPayId,c.UserPayDid AS UserPayDid,SUBSTRING(c.UserPayDid,9,3) AS OrderNum ,date_format(a.insertDt, "%Y-%m-%d %H:%i:%s") AS InsertDt,b.NickName AS NickName, c.MenuName AS MenuName,c.Price AS Price,a.OrderCnt AS OrderCnt,c.OrderCnt AS OrderCntDetail ,a.OrderStatus as OrderStatus, c.OptionA AS OptionA, c.OptionB AS OptionB, c.OptionC AS OptionC  ,(SELECT COUNT(0) FROM UserPayDetail UPD WHERE UPD.UserPayId = a.UserPayId ) AS realCount  	FROM UserPay a, User b, UserPayDetail c WHERE a.SsoKey=b.SsoKey AND a.UserPayId = c.UserPayid AND a.StoreId =  '
      +"'"+MStoreId+"'"+ ' AND a.UserPayId = '
      + '"' + MUserPayId + '"';
      conn.connection.query(selectSql, function (error, rows, fields) {
      if (error) {
          console.log("UserPay select error - ", Date());
          reject({ code: error, msg: error });
        } else {
          console.log("UserPay select success - ", Date());
          console.log("mongo insert 데이터 select success - ", rows);
          resolve({ code: 0, info:rows, length:rows.length});
        }  
     });
  });
}
//MongoDB 취소요청 시 상태값 업데이트
var MCanclePay = (UserPayId) =>{
  let UpdateData = [UserPayId];
  var d = new Date();
  let CancleTime = moment(d).format('YYYY-MM-DD HH:mm:ss');
  let OrderStatus = 'CP';
  return new Promise((resolve,reject)=> {
      console.log("Mongo OrderStatus Update data > ", UpdateData,CancleTime);
      MongoClient.connect(url, { useUnifiedTopology: true }, function (error, client) {
          if(error){
              console.log("errno > " + error);
              reject({ code: error, msg: error });
          }else{
              console.log("Mongo Connected successfully to server");
              var db = client.db('Quaca');
              var myquery = { UserPayId: UserPayId };
              var newvalues = { $set: {OrderStatus:OrderStatus, CancleTime: CancleTime } };
              db.collection('Quaca').updateMany(myquery, newvalues,function(err, res) {
                if(err) throw err;
                console.log("Mongo OrderStatus 수정 !");
                resolve({ code: 0});
              });
              
          }
      });
  });
};
exports.UserPaySelectInfo = UserPaySelectInfo
exports.UserPayDetailSelectInfo = UserPayDetailSelectInfo
exports.mariaInsertPay = mariaInsertPay
exports.mariaInsertPayDetail = mariaInsertPayDetail
exports.MongoInsertPayInfo = MongoInsertPayInfo
exports.MongoSelectPayInfo = MongoSelectPayInfo
exports.quickInfo = quickInfo
exports.CanclePay = CanclePay
exports.MongoTodayCount = MongoTodayCount
exports.OrderNumberCount = OrderNumberCount
exports.MCanclePay = MCanclePay