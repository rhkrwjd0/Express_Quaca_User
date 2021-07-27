var express = require('express');
var router = express.Router();
var {rewardCouponCount, rewardselect,rewardHistoryselect,frequencyselect,Avialableselect,Couponselect } = require('../function/reward')

//0130 리워드&쿠폰 조회
router.post('/rewardCouponCount', function (req, res) {
  let SsoKey = req.body.SsoKey;
  let StoreId = req.body.StoreId;
  console.log('SsoKey,StoreId > ',SsoKey,StoreId);
  rewardCouponCount(SsoKey,StoreId)
  .then((resrewardInfo) => {
    if (resrewardInfo.code == 0 && resrewardInfo.rows > 0 ) {
        res.json({ success: true, info: resrewardInfo.info });
        console.log("res reward Select 성공 -", Date());
      }else if(resrewardInfo.code == 0  && resrewardInfo.rows == 0 ){
        res.json({ success: false, msg: null});
        console.log("res reward Select 실패 - null" , Date());
      }else {
        res.json({ success: false, msg: resrewardInfo.msg });
        console.log("res reward Select 실패 -", Date());
      }
})
  .catch((error)=>{
      res.json({  success:false , msg: "error" });
      console.log("res reward Select catch - reward Select 실패 :", error, " - ", Date());
  })
});

//013 리워드 조회
router.post('/reward', function (req, res) {
    let SsoKey = req.body.SsoKey;
    let StoreId = req.body.StoreId;
    console.log('SsoKey,StoreId > ',SsoKey,StoreId);
    rewardselect(SsoKey,StoreId)
    .then((resrewardInfo) => {
      if (resrewardInfo.code == 0 && resrewardInfo.rows > 0 ) {
          res.json({ success: true, info: resrewardInfo.info });
          console.log("res reward Select 성공 -", Date());
        }else if(resrewardInfo.code == 0  && resrewardInfo.rows == 0 ){
          res.json({ success: false, msg: null});
          console.log("res reward Select 실패 - null" , Date());
        }else {
          res.json({ success: false, msg: resrewardInfo.msg });
          console.log("res reward Select 실패 -", Date());
        }
  })
    .catch((error)=>{
        res.json({  success:false , msg: "error" });
        console.log("res reward Select catch - reward Select 실패 :", error, " - ", Date());
    })
});
//013_1 리워드 히스토리 조회
router.post('/rewardHistory', function (req, res) {
  let SsoKey = req.body.SsoKey;
  let StoreId = req.body.StoreId;
  let SearchType = req.body.SearchType;
  console.log('SsoKey,StoreId > ',SsoKey,StoreId, SearchType);
  rewardHistoryselect(SsoKey, StoreId, SearchType)
  .then((resrewardHistoryInfo) => {
    if (resrewardHistoryInfo.code == 0  && resrewardHistoryInfo.rows > 0) {
        res.json({ success: true, SsoKey:resrewardHistoryInfo.SsoKey,StoreId:resrewardHistoryInfo.StoreId, History:resrewardHistoryInfo.History });
        console.log("res reward Select 성공 -", Date());
      }else if(resrewardHistoryInfo.code == 0  && resrewardHistoryInfo.rows == 0 ){
        res.json({ success: false, msg: null});
        console.log("res rewardHistory Select 실패 - null" , Date());
      } else {
        res.json({ success: false, msg: resrewardHistoryInfo.msg });
        console.log("res rewardHistory Select 실패 -", Date());
      }
})
  .catch((error)=>{
      res.json({  success:false , msg: error.msg });
      console.log("res rewardHistory Select catch - reward Select 실패 :", error, " - ", Date());
  })
});
//014 프리퀀시 조회
router.post('/frequency', function (req, res) {
  let SsoKey = req.body.SsoKey;
  let StoreId = req.body.StoreId;
  console.log('SsoKey,StoreId > ',SsoKey,StoreId);
  frequencyselect(SsoKey,StoreId)
  .then((resfrequencyInfo) => {
    if (resfrequencyInfo.code == 0  && resfrequencyInfo.rows > 0 ) {
        res.json({ success: true, info: resfrequencyInfo.info });
        console.log("res frequency Select 성공 -", Date());
      }else if(resfrequencyInfo.code == 0  && resfrequencyInfo.rows == 0 ){
        res.json({ success: false, msg: null});
        console.log("res frequency Select 실패 - null" , Date());
      } else {
        res.json({ success: false, msg: resfrequencyInfo.msg });
        console.log("res frequency Select 실패 -", Date());
      }
})
  .catch((error)=>{
      res.json({  success:false , msg: "error" });
      console.log("res frequency Select catch - frequency Select 실패 :", error, " - ", Date());
  })
});

//015 쿠폰 History
router.post('/Coupon', function (req, res) {
  let SsoKey = req.body.SsoKey;
  let StoreId = req.body.StoreId;
  console.log('SsoKey > ',SsoKey,StoreId);
  Couponselect(SsoKey,StoreId)
  .then((resCouponInfo) => {
    if (resCouponInfo.code == 0) {
        res.json({ success: true, SsoKey:resCouponInfo.SsoKey,StoreId:resCouponInfo.StoreId, Coupon:resCouponInfo.History });
        console.log("res Coupon Select 성공 -", Date());
      } else {
        res.json({ success: false, msg: resCouponInfo.msg });
        console.log("res Coupon Select 실패 -", Date());
      }
})
  .catch((error)=>{
      res.json({  success:false , msg: error.msg });
      console.log("res Coupon Select catch - Coupon Select 실패 :", error, " - ", Date());
  })
});

//015_1 쿠폰 Avialable조회
router.post('/Avialable', function (req, res) {
  let SsoKey = req.body.SsoKey;
  let StoreId = req.body.StoreId;
  console.log('SsoKey,StoreId > ',SsoKey,StoreId);
  Avialableselect(SsoKey,StoreId)
  .then((resAvialableInfo) => {
    if (resAvialableInfo.code == 0) {
        res.json({ success: true, SsoKey:resAvialableInfo.SsoKey,StoreId:resAvialableInfo.StoreId, Coupon:resAvialableInfo.History });
        console.log("res Avialable조회 Select 성공 -", Date());
      }else {
        res.json({ success: false, msg: resAvialableInfo.msg });
        console.log("res Avialable조회 Select 실패 -", Date());
      }
})
  .catch((error)=>{
      res.json({  success:false , msg: error.msg });
      console.log("res Avialable조회 Select catch - Avialable조회 Select 실패 :", error, " - ", Date());
  })
});


module.exports = router;
