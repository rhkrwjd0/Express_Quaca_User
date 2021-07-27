const { name } = require('ejs');
var express = require('express');
var router = express.Router();
const app = express();
var moment = require('moment');
var conn = require('../components/mariaDB');
const bodyParser = require('body-parser');
const axios = require('axios')
var { UnixTimeChange, AccessToken, PaymentInfo ,OrderbodyTest,TestpaymentData} = require('../function/Common');
var {MCanclePay,OrderNumberCount,CanclePay, UserPaySelectInfo,UserPayDetailSelectInfo,mariaInsertPay,mariaInsertPayDetail,MongoInsertPayInfo, MongoSelectPayInfo,quickInfo } = require('../function/order');
var {rewardselect,rewardInsertInfo,rewardInsertNew,rewardInsertOver,frequencyselect,frequencyInsertNew,frequencyInsertOverS,frequencyInsert} = require('../function/reward');

//QU_007 결제내역
//로그인 사용자 결제목록
//(주문번호-진동벨번호같은..?, 대표메뉴 아이디, 총수량, 주문시간, 제조완료T/F, 총 결제금액)
router.post('/UserPay', function (req, res, next) {
  let StoreId = req.body.StoreId;
  let SsoKey = req.body.SsoKey;
  let SearchType = req.body.SearchType;
  let StartDt = req.body.StartDt;
  let EndDt = req.body.EndDt;

  console.log('받아온 SsoKey > ',SsoKey, StoreId);
  UserPaySelectInfo(StoreId, SsoKey, SearchType, StartDt, EndDt)
    .then((resSelectUserPay)=>{
      if ((resSelectUserPay.code == 0) && (resSelectUserPay.rows > 0)) {
        res.json({ success: true, info: resSelectUserPay.info });
        console.log("UserPay res Select 성공 -", Date());
      }else if((resSelectUserPay.code == 0) && (resSelectUserPay.rows == 0)){
        res.json({ success: false, msg: null});
        console.log("res User 데이터 값 없음 -", Date());
      } else {
        res.json({ success: false, msg: resSelectUserPay.msg });
        console.log("UserPay res Select  실패 -", Date());
      }
    })
    .catch((error) => {
      res.json({ code: 999, msg: "error" });
      console.log("resSelectUserPay catch - UserPayId select 실패 :", error, " - ", Date());
    })
});

//QU_008 결제상세내역
// 선택한 결제 상세정보
//(결제완료시간, 주문완료시간, 포장T/F, 주문메뉴+가격+옵션 목록, 결제종류, 총 결제금액, 포장T/F)
router.post('/UserPayDetail', function (req, res, next) {
  var UserPayId = req.body.UserPayId;
  console.log(UserPayId);
  UserPayDetailSelectInfo(UserPayId)
    .then((resSelectUserPayDetail)=>{
      if (resSelectUserPayDetail.code == 0) {
        res.json({ success: true, info: resSelectUserPayDetail.info });
        console.log("UserPayDetail res Select 성공 -", Date());
      } else {
        res.json({success: false, msg: resSelectUserPayDetail.msg });
        console.log("UserPayDetail res Select  실패 -", Date());
      }
    })
    .catch((error)=>{
      res.json({ success: false, msg: "error" });
      console.log("resSelectUserPayDetail catch - UserPayDetail select 실패 :", error, " - ", Date());
    })
});

//QU_011 결제완료
//결제 완료 후 결제db에 결제정보 저장
router.use(bodyParser.json());
router.post('/payment', async (req, res) => {
  //test json 데이터
  //console.log('~~~~~~~~~~~~~~~~~~~~~#########~~',OrderbodyTest);
  //let reqbody = OrderbodyTest;

  //실제 앱에서 받아오는 데이터
  console.log('1. 프론트에서 받아오는데이터 > ', req.body)
  let reqbody = req.body;
  
  try {
    var imp_uid = reqbody.PGUid; //PGUid
    //var imp_uid = 'imp_146978253658';
    var merchant_uid = reqbody.merchant_uid;
    console.log('1.2', imp_uid);

    // 액세스 토큰(access token) 발급 받기
    AccessToken()
      .then((resToken) => {
        console.log('1.4 액세스토큰', resToken);

        //imp_uid로 아임포트 서버에서 결제 정보 조회
        PaymentInfo(imp_uid, resToken)
          .then((paymentDataInfo) => {
            console.log('2.1  ', paymentDataInfo);
          // 결제정보 담아줌 
          let paymentData = paymentDataInfo;

          //테스트 결제정보
          //let paymentData = TestpaymentData;  

          //1. 결제정보 UserPay, UserPayDetail 테이블 Insert
          var d = new Date();
          let SsoKey = reqbody.SsoKey;
          console.log('SsoKey > ',SsoKey);
          let PGUid = imp_uid;
          let UserPayId = (moment(d).format('YYMMDD') + '-' + PGUid);
          let StoreId = reqbody.StoreId;
          let MenuId = reqbody.cartParam[0].id;
          let FirstMenuName = reqbody.cartParam[0].name;
          let cartParam = reqbody.cartParam;
          let OrderCnt = reqbody.cartParam.length;
          let OrderCntDetail =  reqbody.cartParam[0].cnt;
          let OrderStatus = 'OC'; 
          var timestamp = paymentData.response.paid_at;
          console.log('timestamp > ',timestamp); 
          var PayCompleteTime = UnixTimeChange(timestamp); 
          let TotalPrice = paymentData.response.amount;
          console.log('TotalPrice > ',TotalPrice); 
          var InsertDT = moment(d).format('YYYY-MM-DD HH:mm:ss');

          console.log('3', UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT);
          if(OrderCnt > 1){
             //마리아DB UserPay Insert
             let tempOrderCnt = 0
              for(var i=0; i<OrderCnt; i++){
                tempOrderCnt +=  Number(reqbody.cartParam[i].cnt);
              }
              OrderCnt = tempOrderCnt;
              console.log('UserPay insert OrderCnt 값 > ',OrderCnt);
              mariaInsertPay(UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT)
              .then((resInsertUserPay) => {
                if (resInsertUserPay.code == 0) {
                  console.log("3.2. res InsertUserPay 성공 -", Date());
                } else {
                  res.json({ success: false, msg: resInsertUserPay.msg });
                  console.log("3.3. res InsertUserPay 실패 -", Date());
                }
              })
              .catch((error) => {
                res.json({ success: false, msg: "error" });
                console.log("userpay join 실패 :",error," - ",Date());
              });
          }else{
            //마리아DB UserPay Insert
            OrderCnt = OrderCntDetail
            mariaInsertPay(UserPayId,SsoKey,StoreId,MenuId,FirstMenuName,OrderCnt,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT)
            .then((resInsertUserPay) => {
              if (resInsertUserPay.code == 0) {
                console.log("3.2. res InsertUserPay 성공 -", Date());
              } else {
                res.json({ success: false, msg: resInsertUserPay.msg });
                console.log("3.3. res InsertUserPay 실패 -", Date());
              }
            })
            .catch((error) => {
              res.json({ success: false, msg: "error" });
              console.log("userpay join 실패 :",error," - ",Date());
            });
          }
          //아메리카노가 2개라면 lenth가 1개로 나옴
          //OrderCnt 가 1 이상이면 reqbody.cartParam.length;로 for문, 1이라면 reqbody.cartParam.cnt로 가져와서 for문돌려야함  
          OrderCnt = reqbody.cartParam.length;
          let OrderManyCnt = reqbody.cartParam.length;
          if(OrderCnt > 1){
            OrderCnt = reqbody.cartParam.length;
            console.log('4.0 OrderCnt.lenth 1이상 > ',OrderCnt);
            //1.2 UserPayDetail INSERT
            for(var i=0; i<reqbody.cartParam.length; i++){
              let PayMethod = paymentData.response.pay_method;
              let DetailMenuId = reqbody.cartParam[i].id;
              let MenuName = reqbody.cartParam[i].name;
              let Price = reqbody.cartParam[i].price;
              OrderCnt = reqbody.cartParam[i].cnt;
              let OptionA = reqbody.cartParam[i].option.OptionA;
              let OptionB = reqbody.cartParam[i].option.OptionB;
              let OptionC = reqbody.cartParam[i].option.OptionC;

            console.log('4', UserPayId,StoreId,PayMethod,OrderCnt,MenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT);
            //마리아DB UserPayDetail Insert
            mariaInsertPayDetail(UserPayId,StoreId,PayMethod,OrderCnt,DetailMenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT)
            .then((resInsertUserPayDetail) => {
              if (resInsertUserPayDetail.code == 0) {
                console.log("4.2. res InsertUserPayDetail 성공 -", Date());
              } else {
                res.json({ success: false, msg: resInsertUserPayDetail.msg });
                console.log("4.3. res InsertUserPayDetail 실패 -", Date());
              }
            })
            .catch((error) => {
              res.json({ success: false, msg: "error" });
              console.log("디테일 인설트 실패  :",error," - ", Date());
            });
          }
        }
        //1.2 UserPayDetail INSERT
        else{ 
            console.log('4.0 OrderCnt.lenth 1이하 > '+OrderCnt);
          //  for(var i=0; i<OrderCntDetail; i++){
              OrderCnt = reqbody.cartParam[0].cnt;
              let PayMethod = paymentData.response.pay_method;
              let DetailMenuId = reqbody.cartParam[0].id;
              let MenuName = reqbody.cartParam[0].name;
              let Price = reqbody.cartParam[0].price;
              let OptionA = reqbody.cartParam[0].option.OptionA;
              let OptionB = reqbody.cartParam[0].option.OptionB;
              let OptionC = reqbody.cartParam[0].option.OptionC;

            console.log('4', UserPayId,StoreId,PayMethod,OrderCnt,MenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT);
            //마리아DB UserPayDetail Insert
            mariaInsertPayDetail(UserPayId,StoreId,PayMethod,OrderCnt,DetailMenuId,MenuName,Price,OptionA,OptionB,OptionC,OrderStatus,PayCompleteTime,TotalPrice,PGUid,InsertDT)
            .then((resInsertUserPayDetail) => {
              if (resInsertUserPayDetail.code == 0) {
                console.log("4.2. res InsertUserPayDetail 성공 -", Date());
              } else {
                res.json({ success: false, msg: resInsertUserPayDetail.msg });
                console.log("4.3. res InsertUserPayDetail 실패 -", Date());
              }
            })
            .catch((error) => {
              res.json({ success: false, msg: "error" });
              console.log("디테일 인설트 실패  :",error," - ", Date());
            });
        //  }
        }
// ===================================MongoDb Insert 시작============================
        //선언부
        let MongoUserPayId = '';
        let MongoUserPayDid = '';
        let MongoOrderNum = '';
        let MongoInsertDt = '';
        let MongoNickName = '';
        let MongoMenuName = '';
        let MongoPrice = '';
        let MongoOrderCnt ='';
        let MongoOrderCntDetail ='';
        let MongoOrderStatus = '';
        let MongoOptionA = '';
        let MongoOptionB = '';
        let MongoOptionC = '';
        let MongorealCount = '';
        let MUserPayId = (moment(d).format('YYMMDD') + '-' + PGUid);
        let MStoreId = reqbody.StoreId;
          //mongo에 insert할 데이터 maria DB에서 조회
          console.log('mongo insert 데이터 search 시작 카운트,값> ',MStoreId,MUserPayId);
          OrderNumberCount(MStoreId,MUserPayId)
            .then((resOrderNumberCount) =>{
              for(var i=0; i<resOrderNumberCount.length; i++){
                MongoUserPayId = resOrderNumberCount.info[i].UserPayId;
                MongoUserPayDid = resOrderNumberCount.info[i].UserPayDid;
                MongoOrderNum = resOrderNumberCount.info[i].OrderNum;
                MongoInsertDt = resOrderNumberCount.info[i].InsertDt;
                MongoNickName = resOrderNumberCount.info[i].NickName;
                MongoMenuName = resOrderNumberCount.info[i].MenuName;
                MongoPrice = resOrderNumberCount.info[i].Price;
                MongoOrderCnt = resOrderNumberCount.info[i].OrderCnt;
                MongoOrderCntDetail = resOrderNumberCount.info[i].OrderCntDetail;
                MongoOrderStatus = resOrderNumberCount.info[i].OrderStatus;
                MongoOptionA = resOrderNumberCount.info[i].OptionA;
                MongoOptionB = resOrderNumberCount.info[i].OptionB;
                MongoOptionC = resOrderNumberCount.info[i].OptionC;
                MongorealCount = resOrderNumberCount.info[i].realCount;
                console.log('Mongo 넣을 데이터 > ',MongoUserPayId,MongoUserPayDid,MongoOrderNum,MongoInsertDt,MongoNickName,MongoMenuName,MongoPrice,MongoOrderCnt,MongoOrderCntDetail,MongoOrderStatus,MongoOptionA,MongoOptionB,MongoOptionC,MongorealCount);
                //5.2 MongoDB에 import에서 넘어온 데이터 저장
                console.log("MongoDB에 import 데이터 Insert 시작");
                MongoInsertPayInfo(MStoreId,MongoUserPayId,MongoUserPayDid,MongoOrderNum,MongoInsertDt,MongoNickName,MongoMenuName,MongoPrice,MongoOrderCnt,MongoOrderCntDetail,MongoOrderStatus,MongoOptionA,MongoOptionB,MongoOptionC,MongorealCount,paymentData)
                  .then((mongoinsert) => {
                    if (mongoinsert.code == 0) {
                      //res.json({success: true , UserPayId: UserPayId });
                      console.log("5.2. mongoinsert 성공 -", Date());
                    } else {
                      res.json({ success: false, msg: mongoinsert.msg });
                      console.log("5.3. mongoinsert 실패 -", Date());
                    }
                  })
                  .catch((error) => {
                    res.json({ success: false, msg: "error" });
                    console.log(" 몽고 insert 실패 :",error," - ", Date());
                  });
                //mongo 끝
              }
            })
            .catch((error) =>{
              res.json({ success: false, msg: "error" });
              console.log("mongodb에 넣을 maria 검색데이터 실패  :",error," - ", Date());
            })
            
// ===================================리워드,프리퀀시,쿠폰 시작============================
            OrderCnt = reqbody.cartParam.length;
            console.log('--------리워드 시작 OrderCnt > ',OrderCnt)
            
            console.log('1. 프론트에서 받아온 reward의 StoreId,MenuId,SsoKey,OrderCnt 데이터 > ',StoreId,MenuId,SsoKey,OrderCnt);
            //1.리워드테이블 select해서 현재 리워드 카운트 값 확인
            rewardselect(SsoKey,StoreId)
              .then((resrewardInfo) => {
                let RewardOrderCnt = 0;
                //결제한 메뉴의 총 갯수
                for(var i=0; i<OrderCnt; i++){
                  RewardOrderCnt +=  reqbody.cartParam[i].cnt;
                }
                  OrderCnt = RewardOrderCnt;
                  console.log('--------리워드 시작2 신규 리워드 카운트 > ',OrderCnt)
                  if (resrewardInfo.code == 0 && resrewardInfo.rows > 0 ) {
                      console.log("res reward Select 성공 -", Date());
                      console.log("res reward 기존 리워드 카운트 -", resrewardInfo.info.RewardCnt);
                      let RewardCnt = resrewardInfo.info.RewardCnt;
                      //기존 리워드 카운트+신규 리워드 카운트
                      var SumRewardCnt = Number(RewardCnt) + Number(OrderCnt);
                      if(SumRewardCnt <= 11){
                        //리워드 카운트 12 미만일 시엔 Reward 테이블에 RewardCnt + OrderCnt insert함
                        rewardInsertInfo(StoreId,SsoKey,RewardCnt,OrderCnt)
                        .then((resrewardInsertInfo) => {
                          if (resrewardInsertInfo.code == 0) {
                            console.log("1. res rewardInsertInfo 성공 -", Date());
                          } else {
                            res.json({ success: false, msg: resrewardInsertInfo.msg });
                            console.log("1.1. res rewardInsertInfo 실패 -", Date());
                          }
                        })
                        .catch((error) => {
                          res.json({ success: false, msg: "error" });
                          console.log("rewardInsertInfo 인설트 실패  :",error," - ", Date());
                        });
                        }else if(SumRewardCnt >= 12){
                          //리워드 카운트 12 이상일 시엔 Reward 테이블에 OrderCnt - 1 으로 insert함
                          //Coupon 테이블에 리워드쿠폰 Insert 함 (쿠폰 내용은 CouponInfo테이블 데이터 insert)
                          rewardInsertOver(StoreId,SsoKey,RewardCnt,OrderCnt)
                          .then((resrewardInsertOver) => {
                            if (resrewardInsertOver.code == 0) {
                              console.log("2.2. res resrewardInsertOver 성공 -", Date());
                              res.json({ success: true, info: 'resrewardInsertOver 성공' });
                            } else {
                              res.json({ success: false, msg: resrewardInsertOver.msg });
                              console.log("2.2. res resrewardInsertOver 실패 -", Date());
                            }
                          })
                          .catch((error) => {
                            res.json({success: false,msg: "error"});
                            console.log("resrewardInsertOver 인설트 실패  :",error," - ", Date());
                          });
                        }
                    }else if(resrewardInfo.code == 0  && resrewardInfo.rows == 0 ){
                        console.log("res reward Select 값없음 - null" , Date());
                        //신규회원이어서 리워드가 없을시 Reward 테이블에 cnt 를 OrderCnt 으로 insert함
                        rewardInsertNew(StoreId,SsoKey,OrderCnt)
                          .then((resrewardInsertNew) => {
                            if (resrewardInsertNew.code == 0) {
                              console.log("3.1. res rewardInsertNew 성공 -", Date());
                            } else {
                              res.json({ success: false, msg: resrewardInsertNew.msg });
                              console.log("3.2. res rewardInsertNew 실패 -", Date());
                            }
                          })
                          .catch((error) => {
                            res.json({ success: false, msg: "error" });
                            console.log("rewardInsertNew 인설트 실패  :",error," - ", Date());
                          });
                    }else {
                      res.json({ success: false, msg: resrewardInfo.msg });
                      console.log("res reward Select 실패 -", Date());
                    }
              })
              .catch((error)=>{
                  res.json({  success:false , msg: "error" });
                  console.log("res reward Select catch - reward Select 실패 :", error, " - ", Date());
              })
          
            OrderCnt = reqbody.cartParam.length;
            let frequencySCnt = 0;
            let frequencyDCnt = 0;
            for(var i=0; i<OrderCnt; i++){
              if(reqbody.cartParam[i].id.substr(0,1) == 'S' ){
                frequencySCnt +=  reqbody.cartParam[i].cnt;
              }else{
                frequencyDCnt +=  reqbody.cartParam[i].cnt;
              }
            }
            frequencySCnt = frequencySCnt;
            frequencyDCnt = frequencyDCnt;
            console.log('frequency 시작, 스페셜,일반 카운트 갯수 확인 >  ',frequencySCnt,frequencyDCnt);
            let FirstOrderNum = '';
            //2.프리퀀시 select해서 카운트 값 확인
            frequencyselect(SsoKey,StoreId)
            .then((resfrequencyInfo) => {
              FirstOrderNum = resfrequencyInfo.info.UserPayDid.substr(8,3);
              console.log('FirstOrderNum > ',FirstOrderNum);
              if (resfrequencyInfo.code == 0 && resfrequencyInfo.rows > 0 ) {
                console.log("res frequency Select 성공 -", Date());
                console.log("res frequency Special Count -", resfrequencyInfo.info.Special);
                console.log("res frequency Basic Count -", resfrequencyInfo.info.Basic);
               
                var Special = resfrequencyInfo.info.Special;
                var Basic = resfrequencyInfo.info.Basic;
              
                //1. 프리퀀시 스페셜티  3이상 기본 10 이상일 때 Coupon테이블 Insert
                //Frequency 테이블 Update      
                  if( (Number(Special)+Number(frequencySCnt) > 2) && (Number(Basic)+Number(frequencyDCnt) > 9) ){
                    console.log("res 프리퀀시 조건 충족 -  Frequency - S ,Coupon Insert 시작  " , Date());
                    frequencyInsertOverS(StoreId,SsoKey,Special,Basic,frequencySCnt,frequencyDCnt)
                    .then((resfrequencyInsertOverS) => {
                      if (resfrequencyInsertOverS.code == 0) {
                        res.json({ success: true, info: 'frequencyInsertOver S 성공' ,UserpayId:UserPayId, OrderNum : FirstOrderNum});
                        console.log("res frequencyInsertOver S 성공 -", Date());
                      }else {
                        res.json({ success: false, msg: resfrequencyInsertOverS.msg });
                        console.log("res frequencyInsertOver S 실패 -", Date());
                      }
                    })
                    .catch((error) => {
                      res.json({ success: false, msg: "error" });
                      console.log("frequencyInsertOver S Update 실패  :",error," - ", Date());
                    });
                  }else{ 
                    //Frequency Update 시작
                    console.log("res Frequency Update 시작  " , Date());    
                    frequencyInsert(StoreId,SsoKey,Special,Basic,frequencySCnt,frequencyDCnt)
                      .then((resfrequencyInsert) => {
                        if (resfrequencyInsert.code == 0) {
                          res.json({ success: true, info: 'frequencyUpdate  성공',UserPayId:UserPayId,OrderNum : FirstOrderNum });
                          console.log("res frequency Update   성공 -", Date());
                        }else {
                          res.json({ success: false, msg: resfrequencyInsert.msg });
                          console.log("res frequency Update   실패 -", Date());
                        }
                      })
                      .catch((error) => {
                        res.json({ success: false, msg: "error" });
                        console.log("frequencyUpdate   Update 실패  :",error," - ", Date());
                      });
                  }
                
              //프리퀀시 row값 없음- 프리퀀시 최초 생성
              }else if(resfrequencyInfo.code == 0  && resfrequencyInfo.rows == 0 ){
                console.log("res frequency Select 값없음 - null" , Date());
                var Special = '0';
                var Basic = '0';
                frequencyInsertNew(StoreId,SsoKey,Special,Basic,frequencySCnt,frequencyDCnt)
                  .then((resfrequencyInsertNew) => {
                    if (resfrequencyInsertNew.code == 0) {
                      res.json({ success: true, info: 'frequencyInsertNew 성공',UserPayId:UserPayId,OrderNum : FirstOrderNum });
                      console.log("3.1. res frequencyInsertNew 성공 -", Date());
                    } else {
                      res.json({ success: false, msg: resfrequencyInsertNew.msg });
                      console.log("3.2. res frequencyInsertNew 실패 -", Date());
                    }
                  })
                  .catch((error) => {
                    res.json({ success: false, msg: "error" });
                    console.log("frequencyInsertNew 인설트 실패  :",error," - ", Date());
                  });
              }else {
                res.json({ success: false, msg: resfrequencyInfo.msg });
                console.log("res frequencyInfo Select 실패 -", Date());
              }
            })
              .catch((error)=>{
                res.json({  success:false , msg: "error" });
                console.log("res frequency Select catch - frequency Select 실패 :", error, " - ", Date());
            })
          })
          .catch((error) => {
            console.log('import 정보조회 err > ', error)
          })
      })
      .catch((error) => {
        console.log('access token err > ', error)
      })
  } catch (e) {
    res.json({ success: false, msg: e });
  }
});


//QU_011_1
//import결제정보 조회
router.post('/selectpayment', function (req, res, next) {
  var UserPayId = req.body.UserPayId;
  console.log('import결제정보 조회 UserPayId > ', UserPayId);
  MongoSelectPayInfo(UserPayId)
    .then((resSelectUserPayId) => {
      if ((resSelectUserPayId.code == 0) && (resSelectUserPayId.info != 'null')) {
        res.json({ success: true, info: resSelectUserPayId.info });
        console.log("Mongo SelectPayInfo 성공 -", Date());
      }else if((resSelectUserPayId.code == 0) && (resSelectUserPayId.rows == 'null')){
        res.json({ success: false,  msg: resSelectUserPayId.msg});
        console.log("Mongo SelectPayInfo 데이터 값 없음 -", Date());
      } else {
        res.json({ success: false, msg: resSelectUserPayId.msg });
        console.log("Mongo SelectPayInfo 실패 -", Date());
      }
    })
    .catch((error) => {
      res.json({ success: false, msg: "error" });
      console.log("resSelectUserPayId catch - UserPayId select 실패 :", error, " - ", Date());
    });
});

// //프리퀀시test
// router.post('/testtesttest', function (req, res, next) {
//   var StoreId = req.body.StoreId;
//   var MenuId = req.body.MenuId;
//   var SsoKey = req.body.SsoKey;
  
// });

//QU_016 퀵오더조회
router.post('/quickInfo', function (req, res, next) {
  var SsoKey = req.body.SsoKey;
  var StoreId = req.body.StoreId;
  console.log('퀵오더조회 index.js > ', SsoKey,StoreId,);
  quickInfo(SsoKey,StoreId)
    .then((resquickInfo) => {
      if ((resquickInfo.code == 0) && (resquickInfo.info != 'null')) {
        res.json({ success: true, info: resquickInfo.info });
        console.log("Mongo quickInfo 성공 -", Date());
      }else if((resquickInfo.code == 0) && (resquickInfo.rows == 'null')){
        res.json({ success: false,  msg: resquickInfo.msg});
        console.log("Mongo quickInfo 데이터 값 없음 -", Date());
      } else {
        res.json({ success: false, msg: resSelectUserPayId.msg });
        console.log("Mongo quickInfo 실패 -", Date());
      }
    })
    .catch((error) => {
      res.json({ success: false, msg: "error" });
      console.log("quickInfo catch - quickInfo select 실패 :", error, " - ", Date());
    });
});


//유닉스타임test
router.post('/testtest', function (req, res, next) {
  var timestamp = req.body.test;
  console.log(timestamp);
  var PayCompleteTime = UnixTimeChange(timestamp);
  console.log(PayCompleteTime);
  res.json({ success:true ,msg: PayCompleteTime });
});


//QU_018 결제취소요청
router.post('/CanclePay', function (req, res, next) {
  var UserPayId = req.body.UserPayId;
  //Mongo 상태값 변경 시작
  MCanclePay(UserPayId)
    .then((resMCanclePay)=>{
      if (resMCanclePay.code == 0) {
        console.log("MCanclePay 성공 -", Date());
        //Maria 상태값 변경 시작
        CanclePay(UserPayId)
        .then((resCanclePay) => {
          if ((resCanclePay.code == 0) && (resCanclePay.info != 'null')) {
            res.json({ success: true, info: resCanclePay.info });
            console.log("CanclePay 성공 -", Date());
          }else if((resCanclePay.code == 0) && (resCanclePay.rows == 'null')){
            res.json({ success: false,  msg: resCanclePay.msg});
            console.log("CanclePay 데이터 값 없음 -", Date());
          } else {
            res.json({ success: false, msg: resCanclePay.msg });
            console.log("CanclePay 실패 -", Date());
          }
        })
        .catch((error) => {
          res.json({ success: false, msg: "error" });
          console.log("CanclePay catch - CanclePay select 실패 :", error, " - ", Date());
        });
      }else{
        res.json({ success: false, msg: resMCanclePay.msg });
        console.log("MCanclePay 실패 -", Date());
      }
    })
    .catch((error)=>{
      res.json({ success: false, msg: "error" });
      console.log("CanclePay catch - CanclePay select 실패 :", error, " - ", Date());
    })
});

module.exports = router;
