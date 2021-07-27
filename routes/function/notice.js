var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');
// 첫화면 공지사항 팝업
var noticeselect = (StoreId,NowDate) =>{
    let NoticeData = [StoreId,NowDate];
    return new Promise((resolve, reject) => {
        console.log('notice select 데이터 >',NoticeData);
        var selectSql = 'SELECT StoreId, DATE_FORMAT(StartDate, "%Y-%m-%d %H:%i") AS StartDate,DATE_FORMAT(EndDate, "%Y-%m-%d %H:%i") AS EndDate, Title,DisCription FROM Notice WHERE StoreId = '
        + '"' + StoreId + '"';
        conn.connection.query(selectSql, function (error, rows) {
            console.log('notice select rows.length > ',rows.length);
            if(error){
                console.log("notice select error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error, msg: error,rows:rows.length });
            }else if(!error && rows.length > 0) {
                    if((NowDate >= rows[0].StartDate) && (NowDate <= rows[0].EndDate) ) { 
                        resolve({success: true, code:0, info: rows, rows:rows.length});
                    }else{
                        reject({ success: false, msg: '공지 기간에서 벗어났습니다.' });
                    } 
            }else if (!error && rows.length == 0) {
                reject({ success: false, msg: error });
            }
        });
    });
}
// 자주하는 질문(사용자) or FAQ(관리자)
var FAQ = (StoreId) =>{
    let FAQData = [StoreId];
    return new Promise((resolve, reject) => {
        console.log('FAQ select 데이터 >',FAQData);
        var selectSql = 'SELECT * FROM InquireBoard WHERE StoreId = '
        + '"' + StoreId + '"'+' and UseYn = "Y"';
        conn.connection.query(selectSql, function (error, rows) {
            if(error){
                console.log("FAQ select error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else if(!error && rows.length > 0) {
                resolve({success: true, code:0, info: rows});
            }else if (!error && rows.length == 0) {
                reject({ success: false, msg: error });
            }
        });
    });
}
// 1:1문의 내역(사용자) or 고객센터(관리자) 목록
var AskList = (StoreId, SsoKey) =>{
    return new Promise((resolve, reject) => {
        let AskListData = [StoreId, SsoKey];
        console.log('AskList select 데이터 >',AskListData);
        let selectSql = 'SELECT '
                            +'Sid, StoreId, SsoKey, Title, Contents, ReContents, '
                            +'UseYn, InsertNm, DATE_FORMAT(InsertDt, "%Y.%m.%d %H:%i") AS InsertDt, '
                            +'UpdateNm, DATE_FORMAT(UpdateDt, "%Y.%m.%d %H:%i") AS UpdateDt '
                        +'FROM SuggestBoard '
                        +'WHERE UseYn = "Y" '
                        +'AND StoreId = ? '
                        +'AND SsoKey = ? '
                        +'ORDER BY InsertDt DESC; ';
        let sql = require('mysql').format(selectSql , AskListData);  
        console.log(sql)
        conn.connection.query(sql, function (error, rows) {
            if(error){
                console.log("AskList select error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                resolve({success: true, code:0, info: rows});
            }
        });
    });
}
// 1:1문의 내역(사용자) or 고객센터(관리자) 등록
var AskInsert = (StoreId, SsoKey, InsertNm, Title, Contents) =>{
    return new Promise((resolve, reject) => {
        var d = new Date();
        let InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');

        let AskInsertData = [StoreId, SsoKey, Title, Contents, InsertNm, InsertDt];
        console.log('AskInsert Insert 데이터 >',AskInsertData);
        let insertSql = 'INSERT INTO SuggestBoard (StoreId, SsoKey, Title, Contents, UseYn, InsertNm, InsertDt) '
                        +'VALUES (?, ?, ?, ?, "Y", ?, ?)';
        let sql = require('mysql').format(insertSql , AskInsertData);  
        conn.connection.query(sql, function (error, rows) {
            console.log("!@",rows)
            if(error){
                console.log("AskInsert Insert error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                resolve({ code: 0 });
            }
        });
    });
}


// 공지사항(사용자) or 공지사항(관리자) 
var NoticeList = (StoreId) =>{
    return new Promise((resolve, reject) => {
        let SearcNoticehData = [StoreId];
        console.log('NoticeList select 데이터 >',SearcNoticehData);

        let selectSql = 'SELECT '
                            +'Sid, StoreId, Title, Contents, UpdateDt, UseYn, InsertNm, '
                            +'DATE_FORMAT(InsertDt, "%Y.%m.%d %H:%i") AS InsertDt '
                        +'FROM NoticeBoard '
                        +'WHERE UseYn = "Y" '
                        +'AND StoreId = ? ';
        let sql = require('mysql').format(selectSql , SearcNoticehData);  
        console.log(sql)
        conn.connection.query(sql, function (error, rows) {
            console.log(rows.length)
            if(error){
                console.log("NoticeList select error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                resolve({ success: true, info: rows});
            }
        });
    });
}

// 공지사항(사용자) or 공지사항(관리자) 
var NoticeInfo = (StoreId, Sid) =>{
    return new Promise((resolve, reject) => {
        let SearcNoticehInfoData = [StoreId, Sid];
        console.log('NoticeList select 데이터 >',SearcNoticehInfoData);

        let selectSql = 'SELECT '
                            +'Sid, StoreId, Title, Contents, UpdateDt, UseYn, InsertNm, '
                            +'DATE_FORMAT(InsertDt, "%Y.%m.%d %H:%i") AS InsertDt '
                        +'FROM NoticeBoard '
                        +'WHERE UseYn = "Y" '
                        +'AND StoreId = ? '
                        +'AND Sid = ?';
        let sql = require('mysql').format(selectSql , SearcNoticehInfoData);  
        console.log(sql)
        conn.connection.query(sql, function (error, rows) {
            console.log(rows.length)
            if(error){
                console.log("NoticeList select error - ", Date());
                console.log("errno > " + error);
                reject({ code: error, msg: error });
            }else{
                resolve({ success: true, info: rows[0]});
            }
        });
    });
}

exports.noticeselect = noticeselect
exports.FAQ = FAQ
exports.AskList = AskList
exports.AskInsert = AskInsert
exports.NoticeList = NoticeList
exports.NoticeInfo = NoticeInfo 