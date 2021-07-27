var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');

//QU_004 매장목록(all)
//사용자위치랑 가까운순으로 매장목록(*프로토타입까진 전체조회)
var AllStoreInfo = (Addr) =>{
    return new Promise((resolve, reject) => {
      console.log('Store All select 데이터 >'+Addr);
      
        let addrData = ["%"+Addr+"%", "%"+Addr+"%"];
        let selectSql = 'SELECT '
                          +'StoreId, StoreName, OpenTime, CloseTime, DayOff, TelNo, Addr1, Addr2, Lat, Lon, '
                          +'SigunguCode, MainImgUrl, detailImgUrl, UseYn, DATE_FORMAT(InsertDt, "%Y-%m-%d %H:%i") AS InsertDt '
                        +'FROM StoreInfo '
                        +'WHERE UseYn = "Y" '
                        +'AND Addr1 LIKE ? OR Addr2 LIKE ? ';
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
    let StoreIdData = [StoreId];
    return new Promise((resolve, reject) => {
        console.log('Store select 데이터 >',StoreIdData);
        var selectSql = 'SELECT StoreId,StoreName,OpenTime,CloseTime,DayOff,TelNo,Addr1,Addr2,Lat,Lon,SigunguCode,MainImgUrl,detailImgUrl,UseYn,date_format(InsertDt, "%Y-%m-%d %H:%i") AS InsertDt FROM StoreInfo where StoreId = '
        +'"' +StoreIdData + '"'
        conn.connection.query(selectSql, function (error, rows, fields) {
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



exports.AllStoreInfo = AllStoreInfo
exports.StoreSelect = StoreSelect