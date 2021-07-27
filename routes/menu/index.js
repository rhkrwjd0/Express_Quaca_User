var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = require('../../app');
var conn = require('../components/mariaDB');
var moment = require('moment');
var { menuselect} = require('../function/menu');

//QU_006. 메뉴정보
//매장 메뉴정보 (카테고리별 메뉴목록-이름,가격,이미지,옵션)
router.post('/select', function (req, res, next) {
    let StoreId = req.body.StoreId;
    menuselect(StoreId)
    .then((resMenuInfo) => {
        if ((resMenuInfo.code == 0) && (resMenuInfo.rows > 0)) {
            res.json({ success: true, info: resMenuInfo.info});
            console.log("res menu Select 성공 -", Date());
          }else if((resMenuInfo.code == 0) && (resMenuInfo.rows == 0)){
            res.json({ success: false,  msg: null });
            console.log("res menu 데이터 값 없음 -", Date());
          } else {
            res.json({ success: false, msg: resMenuInfo.msg });
            console.log("res menu Select 실패 -", Date());
          }
    })
    .catch((error)=>{
        res.json({ success: false, msg: "error" });
        console.log("res menu Select catch - menu Select 실패 :", error, " - ", Date());
    })
});

module.exports = router;