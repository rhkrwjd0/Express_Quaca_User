var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');

//0130 리워드 & 쿠폰 조회(210715)
var rewardCouponCount = (SsoKey,StoreId) =>{
  return new Promise((resolve, reject) => {
    let rewardData = [SsoKey,StoreId,SsoKey,StoreId];
    console.log('reward select 데이터 >',rewardData);
    let selectSql = 'SELECT'
            +'(SELECT Cnt FROM Reward '
              +'WHERE SsoKey = ? AND StoreId = ? Order By InsertDt DESC LIMIT 1) AS RewardCnt, '
            +'(SELECT COUNT(0) FROM Coupon '
              +'WHERE SsoKey = ? AND StoreId = ? AND Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") < DATE_FORMAT(EndDate, "%Y-%m-%d")) AS CouponCnt ;';
    let sql = require('mysql').format(selectSql , rewardData);  
    console.log(sql)
    conn.connection.query(sql, function (error, rows) {
      console.log('rewardData select rows.length > ',rows.length,rows);
      if(error){
          console.log("rewardData select error - ", Date());
          console.log("errno > " + error);
          reject({ success: false, msg: error });
      }else{
          resolve({ success: true,code:0, info:rows[0], rows:rows.length});
      }
    });
  });
}

//013 리워드 조회(210715)
var rewardselect = (SsoKey,StoreId) =>{
  return new Promise((resolve, reject) => {
    let rewardData = [SsoKey,StoreId];
    console.log('reward select 데이터 >',rewardData);
    let selectSql = 'SELECT '
          +'SsoKey, Cnt as RewardCnt, StoreId '
          +'FROM Reward '
          +'WHERE SsoKey = ? '
          +'AND StoreId = ? '
          +'Order By InsertDt DESC LIMIT 1;';
    let sql = require('mysql').format(selectSql , rewardData);  
    console.log(sql)
    conn.connection.query(sql, function (error, rows) {
      console.log('rewardData select rows.length > ',rows.length,rows);
      if(error){
          console.log("rewardData select error - ", Date());
          console.log("errno > " + error);
          reject({ success: false, msg: error });
      }else{
          resolve({ success: true,code:0, info:rows[0], rows:rows.length});
      }
    });
  });
}
//013 리워드 히스토리조회(210715)
var rewardHistoryselect = (SsoKey, StoreId, SearchType) =>{
  return new Promise((resolve, reject) => {
    let HistoryData = [SsoKey,StoreId, SearchType, SearchType];
    console.log('reward select 데이터 >',HistoryData);
    let selectSql = 'SELECT '
                      +'SsoKey, StoreId, CouponType, DATE_FORMAT(InsertDt, "%Y-%m-%d %H:%i") AS InsertDt '
                      +'FROM Reward WHERE SsoKey = ? AND StoreId = ? '
                      +'AND DATE_FORMAT(InsertDt,"%Y-%m-%d") '
                      +'BETWEEN (CASE '
                      +'WHEN ? = "3month" THEN DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -3 MONTH),"%Y-%m-%d") '
                      +'WHEN ? = "1month" THEN DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 MONTH),"%Y-%m-%d") '
                      +'ELSE DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 WEEK),"%Y-%m-%d") '
                      +'END) '
                      +'AND DATE_FORMAT(NOW(),"%Y-%m-%d") '
                      +'ORDER BY InsertDt DESC;'
    let sql = require('mysql').format(selectSql , HistoryData);  
    conn.connection.query(sql, function (error, rows) {
      console.log('HistoryData select rows.length > ',rows.length,rows[0]);
      if(error){
        console.log("HistoryData select error - ", Date());
        console.log("errno > " + error);
        reject({ success: false, msg: error,rows:rows.length });
      }else{
        if (rows.length > 0) {                
          resolve({ success: true,code: 0,SsoKey:SsoKey, StoreId:StoreId, History: rows, rows:rows.length });
        }else{
          console.log("sqlMessage > null");
          reject({ success: false , msg:'null'});
        }
      }
    });
  });
}
//014 프리퀀시 조회
var frequencyselect = (SsoKey,StoreId) =>{
    let frequencyData = [SsoKey,StoreId];
    return new Promise((resolve, reject) => {
        console.log('frequency select 데이터 >',frequencyData);
        //var selectSql = 'SELECT SsoKey,StoreId,Special,Basic FROM Frequency WHERE SsoKey = '
        //+ "'" + SsoKey + "'"+ 'and StoreId = '+"'"+StoreId+"'";
        var selectSql = 'SELECT a.SsoKey,a.StoreId,a.Special,a.Basic,c.UserPayDid , c.InsertDt FROM Frequency a, UserPay b, UserPayDetail c  WHERE a.SsoKey = '
        + "'" + SsoKey + "'"+ 'and a.StoreId = '+"'"+StoreId+"'"
        + 'AND a.SsoKey = b.SsoKey AND b.UserPayId = c.UserPayId ORDER BY c.InsertDt desc';
        conn.connection.query(selectSql, function (error, rows) {
            console.log('frequency select rows.length > ',rows.length,rows[0]);
            if(error){
                console.log("frequency select error - ", Date());
                console.log("errno > " + error);
                reject({ success: false, msg: error,rows:rows.length });
            }else{
                resolve({ success: true,code:0, info:rows[0], rows:rows.length});
            }
        });
    });
  }

//쿠폰 기간 조회(210727)
var CouponSearchList = (SsoKey, StoreId, SearchType) =>{
  return new Promise((resolve, reject) => {
    let couponSearchData = [SsoKey, StoreId, SearchType, SearchType];
    let selectSql = 'SELECT '
                      +'SsoKey,StoreId,Title,Contents, DATE_FORMAT(InsertDt, "%Y.%m.%d") AS InsertDt, '
                      +'DATE_FORMAT(EndDate, "%Y.%m.%d") AS EndDate ,  DATE_FORMAT(UseDate, "%Y.%m.%d") AS UseDate, Used, '
                      +'(CASE '
                        +'WHEN Used = "Y" THEN "사용완료" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") < DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "사용가능" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") > DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "기간만료" '
                        +'END) AS State '
                      +'FROM Coupon '
                      +'WHERE SsoKey = ? '
                      +'AND StoreId = ? '
                      +'AND DATE_FORMAT(InsertDt,"%Y-%m-%d") '
                      +'BETWEEN (CASE '
                        +'WHEN ? = "6month" THEN DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -6 MONTH),"%Y-%m-%d") '
                        +'WHEN ? = "3month" THEN DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -3 MONTH),"%Y-%m-%d") '
                        +'ELSE DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 MONTH),"%Y-%m-%d") '
                      +'END) '
                      +'AND DATE_FORMAT(NOW(),"%Y-%m-%d") '
                      +'ORDER BY InsertDt DESC ;'	;
    let sql = require('mysql').format(selectSql , couponSearchData);
    console.log(sql)   
    console.log('couponSearchData select 데이터 >',couponSearchData);
    
    conn.connection.query(sql, function (error, rows) {
        console.log('couponSearchData select rows.length > ',rows.length, rows[0]);
        if(error){
            console.log("couponSearchData select error - ", Date());
            console.log("errno > " + error);
            reject({ success: false, msg: error,rows:rows.length });
        }else{
          resolve({ success: true,code: 0, SsoKey: SsoKey, StoreId: StoreId, Info : rows });
        }
    });
  });
}

//015 쿠폰 전체 조회(210715)
var Couponselect = (SsoKey,StoreId) =>{
  return new Promise((resolve, reject) => {
    let couponData = [SsoKey,StoreId];
    let selectSql = 'SELECT '
                      +'SsoKey,StoreId,Title,Contents, DATE_FORMAT(InsertDt, "%Y.%m.%d") AS InsertDt, '
                      +'DATE_FORMAT(EndDate, "%Y.%m.%d") AS EndDate ,  DATE_FORMAT(UseDate, "%Y.%m.%d") AS UseDate, Used, '
                      +'(CASE '
                        +'WHEN Used = "Y" THEN "사용 완료" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") < DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "사용 가능" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") > DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "기간 만료" '
                        +'END) AS State '
                      +'FROM Coupon '
                      +'WHERE SsoKey = ? '
                      +'AND StoreId = ? ;';
    let sql = require('mysql').format(selectSql , couponData);
    console.log('coupon select 데이터 >',couponData);
    
    conn.connection.query(sql, function (error, rows) {
        console.log('coupon select rows.length > ',rows.length,rows[0]);
        if(error){
            console.log("coupon select error - ", Date());
            console.log("errno > " + error);
            reject({ success: false, msg: error,rows:rows.length });
        }else{
          if(rows.length > 0){
            resolve({ success: true,code: 0, SsoKey:SsoKey, StoreId:StoreId, History: rows });
          }else{
            console.log("sqlMessage > null");
            reject({ success: false , msg:'null'});
          }
        }
    });
  });
}

//015_1 쿠폰 Avialable조회 조회(210715)
var Avialableselect = (SsoKey,StoreId) =>{
  return new Promise((resolve, reject) => {
    let AvialableData = [SsoKey,StoreId]; 
    let selectSql = 'SELECT '
                      +'SsoKey, StoreId, Title, Contents, '
                      +'DATE_FORMAT(InsertDt, "%Y.%m.%d") AS InsertDt, '
                      +'DATE_FORMAT(EndDate, "%Y.%m.%d") AS EndDate , '
                      +'DATE_FORMAT(UseDate, "%Y.%m.%d") AS UseDate, Used, '
                      +'(CASE '
                        +'WHEN Used = "Y" THEN "사용 완료" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") < DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "사용 가능" '
                        +'WHEN Used = "N" AND DATE_FORMAT(NOW(), "%Y-%m-%d") > DATE_FORMAT(EndDate, "%Y-%m-%d") THEN "기간 만료" '
                        +'END) AS State '
                      +'FROM Coupon '
                      +'WHERE SsoKey = ? '
                      +'AND StoreId = ? '
                      +'AND Used = "N" '
                      +'AND DATE_FORMAT(NOW(), "%Y-%m-%d") < DATE_FORMAT(EndDate, "%Y-%m-%d")'
                      +'ORDER BY InsertDt ASC ;';
    let sql = require('mysql').format(selectSql, AvialableData);
    console.log('Avialable조회 select 데이터 >',AvialableData);   
    conn.connection.query(sql, function (error, rows) {
      if(error){
          console.log("Avialable조회 select error - ", Date());
          console.log("errno > " + error);
          reject({ success: false, msg: error,rows:rows.length });
      }else{
        if (rows.length > 0) {
          resolve({ success: true,code: 0, SsoKey:SsoKey, StoreId:StoreId, History: rows });
        }else{
          console.log("sqlMessage > null");
          reject({ success: false , msg:'null'});
        }
      }
    });
  });
}


 //리워드 카운트 12 미만일 시엔 Reward 테이블에 cnt + OrderCnt insert함
var rewardInsertInfo = (StoreId,SsoKey,RewardCnt,OrderCnt) =>{
    let StoreIddata = StoreId;
    let SsoKeydata = SsoKey;
    let OrderCntdata = Number(RewardCnt)+Number(OrderCnt);
    let CouponType = '적립';
    var d = new Date();
    var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
    return new Promise((resolve, reject) => {
        console.log("2. reward insert data > ",StoreIddata,SsoKeydata,OrderCntdata,CouponType,InsertDt);
        //var sql = 'INSERT INTO Reward(Cnt,StoreId,SsoKey,CouponType,InsertDt) select(select (SELECT Cnt+? FROM Reward WHERE StoreId = ? AND SsoKey = ? order by InsertDt DESC LIMIT 1) as Cnt from dual),?,?,?,? FROM Dual LIMIT 1';
        //var params = [OrderCntdata,StoreIddata,SsoKeydata,StoreIddata,SsoKeydata,CouponType,InsertDt];
        var sql = 'INSERT INTO Reward(Cnt,StoreId,SsoKey,CouponType,InsertDt) values(?,?,?,?,?)';
        var params = [OrderCntdata,StoreIddata,SsoKeydata,CouponType,InsertDt];
        conn.connection.query(sql, params, function (error, rows, fields) {
            if (error) {
                console.log("reward Insert error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
              } else {
                console.log("reward Insert success - ", Date());

                resolve({ code: 0 });
              }   
            });
        });
}
//리워드 카운트 12 이상일 시엔 Reward 테이블에 cnt 0,쿠폰발행으로 insert함
var rewardInsertOver = (StoreId,SsoKey,RewardCnt,OrderCnt) =>{
  //잔여 리워드 수
  let Cnt = (Number(RewardCnt)+Number(OrderCnt)) % 12;
  cnt = Math.floor(Cnt); //소수점 버림
  //생성된 쿠폰 갯수
  let CouponCnt = (Number(RewardCnt)+Number(OrderCnt)) / 12;
  CouponCnt = Math.floor(CouponCnt); //소수점 버림
  let StoreIddata = StoreId;
  let Title = '리워드 쿠폰';
  let SsoKeydata = SsoKey;
  let CouponType = '쿠폰발행';
  var d = new Date();
  var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
  var EndDate = moment(d.getTime()).add("1", "M").format("YYYY/MM/DD");
  let Used = 'N';
  return new Promise((resolve, reject) => {
    for(var i=0; i<CouponCnt; i++){
      console.log("2.3 reward insert data > ",Cnt,StoreIddata,SsoKeydata,CouponType,InsertDt);
      var sql = 'INSERT INTO Reward(Cnt,StoreId,SsoKey,CouponType,InsertDt) values(?,?,?,?,?)';
      var params = [Cnt,StoreIddata,SsoKeydata,CouponType,InsertDt];
      conn.connection.query(sql, params, function (error, rows, fields) {
        if (error) {
            console.log("reward Insert error - ", Date());
            console.log("errno > ",error);
            reject({ code: error, msg: error });
          } else {
            console.log("reward Insert success - ", Date());
            //Coupon 테이블 Insert 시작
            console.log("2.4 Coupon-reward insert data > ",StoreIddata,SsoKeydata,Title,InsertDt,EndDate,Used);
            var sql = 'INSERT INTO Coupon(Contents,StoreId,SsoKey,Title,InsertDt,EndDate,Used) SELECT(SELECT(SELECT CouponNm FROM CouponInfo WHERE StoreId = ? and LargeDivCd = "R" AND UseYn = "Y" ORDER BY InsertDt DESC LIMIT 1) AS Contents FROM Dual),?,?,?,?,?,? FROM Dual';
            var params = [StoreIddata,StoreIddata,SsoKeydata,Title,InsertDt,EndDate,Used];
            conn.connection.query(sql, params, function (error, rows, fields) {
              if (error) {
                  console.log("Coupon-reward Insert error - ", Date());
                  console.log("errno > ",error);
                  reject({ code: error, msg: error });
                }else {
                  console.log("Coupon-reward Insert success - ", Date());
                  resolve({ code: 0 });
                }   
            });
          }   
        });
      }
  });
}
//신규회원이어서 리워드가 없을시 Reward 테이블에 cnt 1으로 insert함
var rewardInsertNew = (StoreId,SsoKey,OrderCnt) =>{
  let Cnt = OrderCnt;
  let StoreIddata = StoreId;
  let SsoKeydata = SsoKey;
  let CouponType = '적립';
  var d = new Date();
  var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
  return new Promise((resolve, reject) => {
      console.log("2. reward insert data > ",Cnt,StoreIddata,SsoKeydata,CouponType,InsertDt);
      var sql = 'INSERT INTO Reward(Cnt,StoreId,SsoKey,CouponType,InsertDt) values(?,?,?,?,?)';
      var params = [Cnt,StoreIddata,SsoKeydata,CouponType,InsertDt];
      conn.connection.query(sql, params, function (error, rows, fields) {
          if (error) {
              console.log("reward Insert error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
            } else {
              console.log("reward Insert success - ", Date());

              resolve({ code: 0 });
            }   
          });
      });
}

//신규회원이어서 프리퀀시 없을시 Frequency 테이블에 신규 Insert
//스페셜메뉴(S)면 special +1 일반메뉴(D)면 basic +1 
var frequencyInsertNew = (StoreId,SsoKey,Special,Basic,requencySCnt,frequencyDCnt) =>{
  console.log("1.9 frequency insert data >",StoreId,SsoKey,Special,Basic,requencySCnt,frequencyDCnt )
  let StoreIddata = StoreId;
  let SsoKeydata = SsoKey;
  //let MenuIdData = MenuId;
  let SpecialNew = Number(Special) + Number(requencySCnt);
  let BasicNew = Number(Basic) + Number(frequencyDCnt);
  var d = new Date();
  var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
  return new Promise((resolve, reject) => {
      console.log("2. frequency insert data > ",StoreIddata,SsoKeydata,SpecialNew,BasicNew,InsertDt);
      var sql = 'INSERT INTO Frequency(StoreId,SsoKey,Special,Basic,InsertDt) values(?,?,?,?,?)';
      var params = [StoreIddata,SsoKeydata,SpecialNew,BasicNew,InsertDt];
      conn.connection.query(sql, params, function (error, rows, fields) {
          if (error) {
              console.log("frequency Insert New error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
            } else {
              console.log("frequency Insert New success - ", Date());

              resolve({ code: 0 });
            }   
          });
      });
}

//프리퀀시 스페셜티  3이상 기본 10 이상일 때 Coupon테이블 Update
//Frequency 테이블 Special 추가
var frequencyInsertOverS = (StoreId,SsoKey,Special,Basic,frequencySCnt,frequencyDCnt) =>{
  let StoreIddata = StoreId;
  let SsoKeydata = SsoKey;
  var d = new Date();
  var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
  let Title = '프리퀀시 쿠폰';
  var EndDate = moment(d.getTime()).add("1", "M").format("YYYY/MM/DD");
  let Used = 'N';
  var FreSpacial =  Math.floor((Number(Special) + Number(frequencySCnt)) / 3);
  var FreBasic = Math.floor((Number(Basic) + Number(frequencyDCnt)) / 10);
  //쿠폰 생성할 for문 돌려줄 횟수
  var FrequencyCouponCnt = Math.min(FreSpacial,FreBasic);
  var FS = 3;
  var FD = 10;
  var SpecialData = (Number(Special) + Number(frequencySCnt)) - (Number(FS)*Number(FrequencyCouponCnt));
  var BasicData =  (Number(Basic) + Number(frequencyDCnt)) - (Number(FD)*Number(FrequencyCouponCnt));
  return new Promise((resolve, reject) => {
      console.log("2. frequency Over S Update data > ",StoreIddata,SsoKeydata,SpecialData,BasicData,InsertDt);
      var sql = 'Update Frequency  Set StoreId = ? ,SsoKey = ? ,Special = ?, Basic = ?,InsertDt = ? where StoreId = ? and SsoKey = ? ';
      var params = [StoreIddata,SsoKeydata,SpecialData,BasicData,InsertDt,StoreIddata,SsoKeydata];
      conn.connection.query(sql, params, function (error, rows, fields) {
          if (error) {
              console.log("frequency S Update New error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
            } else {
              console.log("frequency S Update New success - ", Date());
              //Coupon 테이블 Insert 시작
              for(var i=0; i<FrequencyCouponCnt; i++){
                console.log("2.4 Coupon-Frequency insert data > ",StoreIddata,SsoKeydata,Title,InsertDt,EndDate,Used);
                var sql = 'INSERT INTO Coupon(Contents,StoreId,SsoKey,Title,InsertDt,EndDate,Used) SELECT(SELECT(SELECT CouponNm FROM CouponInfo WHERE StoreId = ? and LargeDivCd = "F" AND UseYn = "Y" ORDER BY InsertDt DESC LIMIT 1) AS Contents FROM Dual),?,?,?,?,?,? FROM Dual';
                var params = [StoreIddata,StoreIddata,SsoKeydata,Title,InsertDt,EndDate,Used];
                conn.connection.query(sql, params, function (error, rows, fields) {
                  if (error) {
                      console.log("Coupon-Frequency Insert error - ", Date());
                      console.log("errno > " + error);
                      reject({ code: error, msg: error });
                    } else {
                      console.log("Coupon-Frequency Insert success - ", Date());
                      resolve({ code: 0 });
                    }   
                  });
              }
            }   
          });
      });
}
//Frequency Update 시작
var frequencyInsert = (StoreId,SsoKey,Special,Basic,frequencySCnt,frequencyDCnt) =>{
  let StoreIddata = StoreId;
  let SsoKeydata = SsoKey;
 //let MenuIdDataI = MenuIdData;
  let SpecialData = Number(Special) + Number(frequencySCnt);
  let BasicData = Number(Basic) + Number(frequencyDCnt);
  
  var d = new Date();
  var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
  return new Promise((resolve, reject) => {
      console.log("2. frequency Update data > ",StoreIddata,SsoKeydata,SpecialData,BasicData,InsertDt);
      var sql = "Update Frequency Set StoreId = ?, SsoKey = ?, Special = ?, Basic = ?,InsertDt = ? where StoreId = ? and SsoKey = ? ";
      var params = [StoreIddata,SsoKeydata,SpecialData,BasicData,InsertDt,StoreIddata,SsoKeydata];
      conn.connection.query(sql, params, function (error, rows, fields) {
          if (error) {
              console.log("frequency Update  error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
            } else {
              console.log("frequency Update  success - ", Date());
              resolve({ code: 0 });
            }   
          });
      });
}

exports.rewardCouponCount = rewardCouponCount
exports.rewardselect = rewardselect
exports.rewardHistoryselect = rewardHistoryselect
exports.frequencyselect = frequencyselect
exports.Avialableselect = Avialableselect
exports.Couponselect = Couponselect
exports.CouponSearchList = CouponSearchList
exports.rewardInsertInfo = rewardInsertInfo
exports.rewardInsertNew = rewardInsertNew
exports.rewardInsertOver = rewardInsertOver
exports.frequencyInsertNew = frequencyInsertNew
exports.frequencyInsertOverS = frequencyInsertOverS
exports.frequencyInsert = frequencyInsert


