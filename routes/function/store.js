var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');

//QU_004 매장목록(all)
//사용자위치랑 가까운순으로 매장목록(*프로토타입까진 전체조회)
var AllStoreInfo = (Addr, SsoKey) =>{
    return new Promise((resolve, reject) => {
      
      let addrData = [SsoKey, "%"+Addr+"%", "%"+Addr+"%"];
      console.log('Store All select 데이터 >'+addrData);
      let selectSql = 'SELECT '
                        +'si.StoreId, si.StoreName, si.OpenTime, si.CloseTime, si.DayOff, si.TelNo, si.Addr1, si.Addr2, '
                        +'si.Lat, si.Lon, si.SigunguCode, si.MainImgUrl, si.detailImgUrl, si.UseYn, '
                        +'DATE_FORMAT(si.InsertDt, "%Y-%m-%d %H:%i") AS InsertDt, ' 
                        +'fs.FavoritesStoreId, fs.UseYn AS FavoritesYn '
                      +'FROM StoreInfo si '
                      +'LEFT JOIN FavoritesStore fs ON si.StoreId = fs.StoreId AND fs.SsoKey = ? '
                      +'WHERE si.UseYn = "Y" '
                      +'AND si.Addr1 LIKE ? OR si.Addr2 LIKE ? ';
      let sql = require('mysql').format(selectSql , addrData);  
      console.log(sql)

      conn.connection.query(sql, function (error, rows, fields) {
          if (error) {
              console.log("Store All select error - ", Date());
              console.log("errno > " + error.errno);
              console.log("sqlMessage > " + error.sqlMessage);
              reject({ code: error.errno, msg: error.sqlMessage });
            } else {
              console.log("Store All select success - ", Date());
              resolve({ code: 0, info:rows });
            }  
      });
    });
}

//QU_005 선택매장 정보
//클릭한매장 매장정보
var StoreSelect =(StoreId) =>{
  return new Promise((resolve, reject) => {
    let StoreIdData = [StoreId];
    console.log('Store select 데이터 >',StoreIdData);
    var selectSql = 'SELECT '
                      +'StoreId, StoreName, OpenTime, CloseTime, DayOff, TelNo, Addr1, Addr2, Lat, Lon, '
                      +'SigunguCode, MainImgUrl, detailImgUrl, UseYn, '
                      +'DATE_FORMAT(InsertDt, "%Y-%m-%d %H:%i") AS InsertDt '
                    +'FROM StoreInfo '
                    +'WHERE StoreId = ? ';
    let sql = require('mysql').format(selectSql , StoreIdData);  
    console.log(sql)
    conn.connection.query(sql, function (error, rows, fields) {
        console.log('Store select rows.length > ',rows.length);
        if (error) {
            console.log("Store select error - ", Date());
            console.log("errno > " + error.errno);
            console.log("sqlMessage > " + error.sqlMessage);
            reject({ code: error.errno, msg: error.sqlMessage });
        } else {
          console.log("Store select success - ", Date());
          resolve({ code: 0, info:rows, rows:rows.length });
        }  
    });
  });
}

// 매장 즐겨찾기 목록
var FavoritesStoreList = (SsoKey) =>{
  return new Promise((resolve, reject) => {
    
    let favoritesStoreListData = [SsoKey];
    console.log('favoritesStoreListData 데이터 >'+favoritesStoreListData);
    let selectSql = 'SELECT '
                      +'si.StoreId, si.StoreName, si.OpenTime, si.CloseTime, si.DayOff, si.TelNo, si.Addr1, si.Addr2, '
                      +'si.Lat, si.Lon, si.SigunguCode, si.MainImgUrl, si.detailImgUrl, si.UseYn, '
                      +'DATE_FORMAT(si.InsertDt, "%Y-%m-%d %H:%i") AS InsertDt, ' 
                      +'fs.FavoritesStoreId, fs.UseYn AS FavoritesYn '
                    +'FROM StoreInfo si, FavoritesStore fs '
                    +'WHERE si.StoreId = fs.StoreId '
                    +'AND si.UseYn = "Y" '
                    +'AND fs.UseYn = "Y" '
                    +'AND fs.SsoKey = ?';
    let sql = require('mysql').format(selectSql , favoritesStoreListData);  
    console.log(sql)

    conn.connection.query(sql, function (error, rows, fields) {
        if (error) {
            console.log("favoritesStoreList error - ", Date());
            console.log("errno > " + error.errno);
            console.log("sqlMessage > " + error.sqlMessage);
            reject({ code: error.errno, msg: error.sqlMessage });
          } else {
            console.log("favoritesStoreList success - ", Date());
            resolve({ code: 0, info:rows });
          }  
    });
  });
}


// 매장 즐겨찾기 등록(최초)
var FavoritesStoreInsert = (SsoKey, StoreId) =>{
  return new Promise((resolve, reject) => {
      var d = new Date();
      let InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');

      let FavoritesStoreInsertData = [SsoKey, StoreId, InsertDt];
      console.log('FavoritesStoreInsertData 데이터 >',FavoritesStoreInsertData);
      let insertSql = 'INSERT INTO FavoritesStore (SsoKey, StoreId, UseYn, InsertDt) '
                      +'VALUES (?, ?, "Y", ?)';
      let sql = require('mysql').format(insertSql , FavoritesStoreInsertData);  
      conn.connection.query(sql, function (error, rows) {
          console.log("!@FavoritesStoreInsertData rows >>>",rows)
          if(error){
              console.log("FavoritesStoreInsertData error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
          }else{
              resolve({ code: 0 });
          }
      });
  });
}
// 매장 즐겨찾기 수정(찾기 등록 & 해제)
var FavoritesStoreUpdate = (SsoKey, StoreId, FavoritesStoreId, UseYn) =>{
  return new Promise((resolve, reject) => {
      var d = new Date();
      let UpdateDt = moment(d).format('YYYY-MM-DD HH:mm:ss');

      let FavoritesStoreUpdateData = [UseYn, UpdateDt, SsoKey, StoreId, FavoritesStoreId];
      console.log('FavoritesStoreUpdateData 데이터 >',FavoritesStoreUpdateData);
      let updateSql = 'UPDATE '
                        +'FavoritesStore '
                      +'SET '
                        +'UseYn = ?, '
                        +'UpdateDt = ? '
                      +'WHERE SsoKey = ? ' 
                      +'AND StoreId = ? '
                      +'AND FavoritesStoreId = ? ';
      let sql = require('mysql').format(updateSql , FavoritesStoreUpdateData);  
      conn.connection.query(sql, function (error, rows) {
          console.log("!@FavoritesStoreUpdateData rows >>>",rows)
          if(error){
              console.log("FavoritesStoreUpdateData error - ", Date());
              console.log("errno > " + error);
              reject({ code: error, msg: error });
          }else{
              resolve({ code: 0 });
          }
      });
  });
}


exports.AllStoreInfo = AllStoreInfo
exports.StoreSelect = StoreSelect
exports.FavoritesStoreList = FavoritesStoreList
exports.FavoritesStoreInsert = FavoritesStoreInsert
exports.FavoritesStoreUpdate = FavoritesStoreUpdate