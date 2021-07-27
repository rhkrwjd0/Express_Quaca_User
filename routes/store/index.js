var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = require('../../app');
var moment = require('moment');
var conn = require('../components/mariaDB');
var { AllStoreInfo,StoreSelect} = require('../function/store');

//QU_004 매장목록(all)
//사용자위치랑 가까운순으로 매장목록(*프로토타입까진 전체조회)
router.post('/storeselect', function (req, res) {
    let Addr = req.body.Addr;
    console.log("!!!!",Addr)
    AllStoreInfo(Addr)
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


module.exports = router;