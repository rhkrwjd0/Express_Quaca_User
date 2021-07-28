var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = require('../../app');
var moment = require('moment');
var conn = require('../components/mariaDB');
var { AllStoreInfo, StoreSelect, FavoritesStoreList, FavoritesStoreInsert, FavoritesStoreUpdate} = require('../function/store');

//QU_004 매장목록(all)
//사용자위치랑 가까운순으로 매장목록(*프로토타입까진 전체조회)
router.post('/storeselect', function (req, res) {
    let Addr = req.body.Addr;
    let SsoKey = req.body.SsoKey;
    console.log("!!!!", Addr, " // ", SsoKey)
    AllStoreInfo(Addr, SsoKey)
        .then((resAllStoreInfo) => {
            if (resAllStoreInfo.code == 0) {
                res.json({ success: true, info: resAllStoreInfo.info });
                console.log("res Store All Select 성공 -", Date());
              } else {
                res.json({ success: false, msg: resAllStoreInfo.msg });
                console.log("res Store All Select 실패 -", Date());
              }
        })
        .catch((error)=>{
            res.json({ code: 999, msg: "error" });
            console.log("res Store All Select catch - Store All Select 실패 :", error, " - ", Date());
        })
});

//QU_005 선택매장 정보
//클릭한매장 매장정보
router.post('/select', function (req, res) {
    let StoreId = req.body.StoreId;
    StoreSelect(StoreId)
    .then((resAllStoreInfo) => {
        if ((resAllStoreInfo.code == 0) && (resAllStoreInfo.rows > 0)) {
            res.json({ success: true, info: resAllStoreInfo.info[0]});
            console.log("res Store Select 성공 -", Date());
          }else if((resAllStoreInfo.code == 0) && (resAllStoreInfo.rows == 0)){
            res.json({ success: false,  msg: null});
            console.log("res User 데이터 값 없음 -", Date());
          } else {
            res.json({ success: false, msg: resAllStoreInfo.msg });
            console.log("res Store Select 실패 -", Date());
          }
    })
    .catch((error)=>{
        res.json({ success: false, msg: "error" });
        console.log("res Store Select catch - Store Select 실패 :", error, " - ", Date());
    })
});


// 매장 즐겨찾기 목록
router.post('/FavoritesStoreList', function (req, res) {
  let SsoKey = req.body.SsoKey;
  console.log("!!!!", SsoKey)
  FavoritesStoreList(SsoKey)
      .then((resFavoritesStoreList) => {
          if (resFavoritesStoreList.code == 0) {
              res.json({ success: true, info: resFavoritesStoreList.info });
              console.log("res FavoritesStoreList 성공 -", Date());
            } else {
              res.json({ success: false, msg: resFavoritesStoreList.msg });
              console.log("res FavoritesStoreList 실패 -", Date());
            }
      })
      .catch((error)=>{
          res.json({ code: 999, msg: "error" });
          console.log("res FavoritesStoreList catch - [실패] :", error, " - ", Date());
      })
});

// 매장 즐겨찾기 등록 (최초 등록)
router.post('/FavoritesStoreInsert', function (req, res) {
  let StoreId = req.body.StoreId;
  let SsoKey = req.body.SsoKey;
  FavoritesStoreInsert(SsoKey, StoreId)
  .then((resFavoritesStoreInsert) => {
    if (resFavoritesStoreInsert.code == 0) {
      res.json({ success: true });
      console.log("resFavoritesStoreInsert  성공 -", Date());
    }else {
      res.json({ success: false, msg: resFavoritesStoreInsert.msg });
      console.log("resFavoritesStoreInsert  실패 -", Date());
    }
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resFavoritesStoreInsert catch - [실패] :", error, " - ", Date());
  })
});

// 매장 즐겨찾기 수정(찾기 등록 & 해제)
router.post('/FavoritesStoreUpdate', function (req, res) {
  let StoreId = req.body.StoreId;
  let SsoKey = req.body.SsoKey;
  let FavoritesStoreId = req.body.FavoritesStoreId;
  let UseYn = req.body.UseYn;
  FavoritesStoreUpdate(SsoKey, StoreId, FavoritesStoreId, UseYn)
  .then((resFavoritesStoreUpdate) => {
    if (resFavoritesStoreUpdate.code == 0) {
      res.json({ success: true });
      console.log("resFavoritesStoreUpdate  성공 -", Date());
    }else {
      res.json({ success: false, msg: resFavoritesStoreUpdate.msg });
      console.log("resFavoritesStoreUpdate  실패 -", Date());
    }
  })
  .catch((error)=>{
      res.json({  success:false ,msg: "error" });
      console.log("res resFavoritesStoreUpdate catch - [실패] :", error, " - ", Date());
  })
});

module.exports = router;