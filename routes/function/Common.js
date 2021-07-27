const axios = require('axios')

//유닉스타임 변환
const UnixTimeChange = (timestamp) => {
  if (timestamp == 0) {
    return 0;
  } else {
    var time = new Date(timestamp * 1000);

    const year = time.getFullYear();
    const month = ('0' + (time.getMonth() + 1)).slice(-2);
    const day = ('0' + time.getDate()).slice(-2);
    const hour = ('0' + time.getHours()).slice(-2);
    const minute = ('0' + time.getMinutes()).slice(-2);
    const second = ('0' + time.getSeconds()).slice(-2);

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  }
};


//액세스토큰 발급
const AccessToken = () => {
  return new Promise((resolve, reject) => {
    
    const tokenUrl = "https://api.iamport.kr/users/getToken";
    const params = {
      imp_key: '9894046956436840',
      imp_secret: 'wSAmK0LJNG8S5PPEtgX99pbnUT3QSWLpOmLzmxjads3jhSYL8WVil6Ff0J6SFRitd33AAmKOON86G6SP',
    };

    console.log('1.3 iamport 환경변수 > ',params)

    axios
      .post(tokenUrl, params)
      .then((response) => {
        resolve(response.data);
      }) // SUCCESS
      .catch((error) => {
        reject(error);
      }); // ERROR
  });
};

 // imp_uid로 아임포트 서버에서 결제 정보 조회
const PaymentInfo = (imp_uid, resToken) => {
  let tokenData = [imp_uid,resToken];
  console.log("1.6 tokendata > ",tokenData);
  let access_token = resToken.response.access_token; // 인증 토큰
  console.log('2. iamport에서 받아오는 토큰 > ',access_token);
  return new Promise((resolve, reject) => {
    const url =
      "https://api.iamport.kr/payments/" + imp_uid + "?_token=" + access_token;
    axios
      .get(url)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(err);
      });
  });
};


 // 결제 데이터 프론트에서 받아오는데이터
 var OrderbodyTest =  {
  "SsoKey" : "105468185803851325812",
  'PGUid': 'imp_950406365613',
  'merchant_uid': 'merchant_1625185408437',
  'cartParam': [
    {
      'id': 'DE002',
      'name': '아메리카노',
      'cnt': '2',
      'price': '100',
      'option': [
        
        {"OptionA" : "매장"},
        {"OptionB" : "large"},
        {"OptionC" : "ice"},
        
      ]
    },
    { 'id': 'DE003', 'name': '카푸치노', 'cnt': '1', 'price': '100',
     "option": [{
      "OptionA" : "매장",
      "OptionB" : "large",
      "OptionC" : "ice",
      }] 
    }
  ],
  "StoreId":"1"
};
//paymentData test데이터
var TestpaymentData =  {
  code: 0,
  message: null,
  response: {
    amount: 200,
    apply_num: '',
    bank_code: null,
    bank_name: null,
    buyer_addr: null,
    buyer_email: 'test@test.com',
    buyer_name: 'imianman',
    buyer_postcode: null,
    buyer_tel: '010',
    cancel_amount: 0,
    cancel_history: [],
    cancel_reason: null,
    cancel_receipt_urls: [],
    cancelled_at: 0,
    card_code: null,
    card_name: null,
    card_number: null,
    card_quota: 0,
    card_type: null,
    cash_receipt_issued: false,
    channel: 'mobile',
    currency: 'KRW',
    custom_data: null,
    customer_uid: null,
    customer_uid_usage: null,
    escrow: false,
    fail_reason: null,
    failed_at: 0,
    imp_uid: 'imp_950406365613',
    merchant_uid: 'merchant_1625185408437',
    name: '쿼카오더',
    paid_at: 1625185430,
    pay_method: 'phone',
    pg_id: 'INIpayTest',
    pg_provider: 'html5_inicis',
    pg_tid: 'INIMX_HPP_INIpayTest20210702092350145679',
    receipt_url: 'https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=INIMX_HPP_INIpayTest20210702092350145679&noMethod=1',
    started_at: 1625185406,
    status: 'paid',
    user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-A505N Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.66 Mobile Safari/537.36',
    vbank_code: null,
    vbank_date: 0,
    vbank_holder: null,
    vbank_issued_at: 0,
    vbank_name: null,
    vbank_num: null
  }
}

exports.UnixTimeChange = UnixTimeChange
exports.AccessToken = AccessToken
exports.PaymentInfo = PaymentInfo
exports.OrderbodyTest = OrderbodyTest;
exports.TestpaymentData = TestpaymentData;
