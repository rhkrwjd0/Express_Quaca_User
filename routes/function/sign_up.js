var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');


//QU_001 - 회원가입
//소셜로그인 후 아이디, 토큰, 닉네임 보내면 DB에 저장
var UserInsert = (Token, SsoKey, nick,LoginType,UseYn,InsertDt) =>{
    let UserInsertData = [Token, SsoKey, nick,LoginType,UseYn,InsertDt];
    return new Promise((resolve, reject) => {
        console.log('User Insert 데이터 >',  UserInsertData);
        var InsertSql = 'INSERT INTO User(Token, SsoKey,NickName,LoginType,UseYn,InsertDt) VALUES (?,?,?,?,?,?)';
        conn.connection.query(InsertSql,UserInsertData, function (error, rows, fields) {
            if (error) {
                console.log("User Insert error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("User Insert success - ", Date());
                resolve({ code: 0});
              }  
        });
    });
}
//QU_001_1 -  중복검사
var SignInselect = (SsoKey) =>{
    let singin_Ssokey = [SsoKey];
    return new Promise((resolve, reject) => {
        console.log('User select 데이터 >',  singin_Ssokey);
        var selectSql = 'SELECT * FROM User where SsoKey = ' + '"' + singin_Ssokey + '"';
        conn.connection.query(selectSql, function (error, rows, fields) {
            if (error) {
                console.log("select error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("select success - ", Date());
                resolve({ code: 0});
              }  
        });
    });
}

//QU_002 사용자 토큰 수정
//사용자 아이디, 토큰 보내면 DB에서 사용자 토큰 수정
var UserTokenUpdate = (Token, SsoKey) =>{
    let UpdateData = [Token, SsoKey];
    return new Promise((resolve, reject) => {
        console.log('User Token Upadte 데이터 >',  UpdateData);
        var Updatesql = 'UPDATE User SET Token=? WHERE SsoKey= ?';
        conn.connection.query(Updatesql,UpdateData, function (error, rows, fields) {
            if (error) {
                console.log("User Token Update error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("User Token Update error - ", Date());
                resolve({ code: 0,Token:Token});
              }  
        });
    });
}


//QU_010 사용자목록 조회
//ssokey로 사용자 검색 후 사용자정보 돌려주기
var UserSelectInfo = (SsoKey) =>{
    let Ssokey = [SsoKey];
    return new Promise((resolve, reject) => {
        console.log('User select 데이터 >',  Ssokey);
        var selectSql = 'SELECT UserId, SsoKey, Token, Email, LoginType,NickName, TelNo, UseYn, date_format(InsertDt, "%Y-%m-%d %H:%i") AS InsertDt FROM User '
             + 'where SsoKey = "' + SsoKey + '"';
        conn.connection.query(selectSql, function (error, rows, fields) {
            if (error) {
                console.log("User select error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage });
              } else {
                console.log("User select success - ", Date());
                resolve({ code: 0, info:rows, rows:rows.length });
              }  
        });
    });
}

exports.SignInselect = SignInselect
exports.UserInsert = UserInsert
exports.UserSelectInfo = UserSelectInfo
exports.UserTokenUpdate = UserTokenUpdate