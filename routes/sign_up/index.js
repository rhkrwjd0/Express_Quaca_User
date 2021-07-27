var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = require('../../app');
var conn = require('../components/mariaDB');
var moment = require('moment');
var https = require('https');
var request = require('request');
const { title } = require('process');
var { UserSelectInfo,SignInselect,UserTokenUpdate,UserInsert} = require('../function/sign_up');
let serverurl = "https://tera-energy.github.io/Tera_Quaca_Common/server.json";

//QU_010 사용자목록 조회
//ssokey로 사용자 검색 후 사용자정보 돌려주기
router.post('/select', function (req, res) {
    let SsoKey = req.body.SsoKey;
    console.log(SsoKey);
    UserSelectInfo(SsoKey)
    .then((resUserSelect)=>{
      if ((resUserSelect.code == 0) && (resUserSelect.rows > 0) ) {
        res.json({ success: true, info: resUserSelect.info[0]});
        console.log("res User Select 성공 -", Date());
      }else if((resUserSelect.code == 0) && (resUserSelect.rows == 0)){
        res.json({ success: false,  msg: null });
        console.log("res User 데이터 값 없음 -", Date());
      }else {
        res.json({  success: false,msg: resUserSelect.msg });
        console.log("res User Select  실패 -", Date());
      }
    })
    .catch((error) => {
      res.json({  success: false, msg: "error" });
      console.log("res User catch - User select 실패 :", error, " - ", Date());
    })
});

//QU_001 회원가입
//소셜로그인 후 아이디, 토큰, 닉네임 보내면 DB에 저장
router.post('/join', function (req, res) {
    let Token = req.body.Token;
    let SsoKey = req.body.SsoKey;
    let nick = req.body.nickname;
    let LoginType = req.body.LoginType;
    let UseYn = 'Y'
    var d = new Date();
    var InsertDt = moment(d).format('YYYY-MM-DD HH:mm:ss');
    //중복검사
    SignInselect(SsoKey)
        .then((resSignInselect)=>{
            if (resSignInselect.code == 0) {
                console.log("중복 없음 -", Date());
                UserInsert(Token, SsoKey, nick,LoginType,UseYn,InsertDt)
                    .then((resUserInsert)=>{
                        if (resUserInsert.code == 0) {
                            console.log("resUserm Insert 회원가입 성공 -", Date());
                            res.json({ success: true });
                        }else{
                            console.log("resUser Insert 회원가입 실패 -", Date());
                            res.json({ success: false, msg: resUserInsert.msg })
                        }
                    })
                    .catch((error)=>{
                        console.log("resUser Insert 실패 :", error, " - ", Date());

                    })
              } else {
                console.log("중복된 SsoKey 값 -", Date());
              }
        })
        .catch((error)=>{
            res.json({ success: false, msg: resUserInsert.msg  });
            console.log("resSignInselect 실패 :", error, " - ", Date());
        })
});

//QU_002 사용자 토큰 수정
//사용자 아이디, 토큰 보내면 DB에서 사용자 토큰 수정
router.post('/update', function (req, res) {
    var Token = req.body.Token;
    var SsoKey = req.body.SsoKey;
    console.log(Token, SsoKey);
    //수정 처리
    UserTokenUpdate(Token,SsoKey)
        .then((resUserTokenUpdate) => {
            if (resUserTokenUpdate.code == 0) {
                console.log("res Token 업데이트 성공 -", Date());
                res.json({ success: true,Token:resUserTokenUpdate.Token });
            }else{
                console.log("res User Token 업데이트 실패 -", Date());
                res.json({ success: false,  msg: resUserTokenUpdate.msg })
            }
        })
        .catch((error)=>{
            res.json({ success: false, msg: "error" });
            console.log("ser Token 업데이트 실패 실패 :", error, " - ", Date());
        })
});

module.exports = router;