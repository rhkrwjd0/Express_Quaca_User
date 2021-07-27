var express = require('express');
var router = express.Router();
var { KoreaGeo, KoreaReverseGeo } = require('../function/korGeo')

//동 이름으로 주소 검색
router.post("/geo", function (req, res) {
    const addr = req.body.addr;

    console.log('1. 지역명으로 검색 시작 : ' + addr + ' - ', Date())
    KoreaGeo(addr).then((korGeoResult) => {
        if (korGeoResult.code == 0) {
            res.json(korGeoResult.info);
            console.log('2. 지역명으로 검색 돌려주기 완료 - ', Date())
        } else {
            res.json(korGeoResult.msg);
            console.log('2. 지역명으로 검색 돌려주기 에러 > status : ', korGeoResult.code, ' - ', Date())
        }
    });
});


// =========QU_003===========
// ========위치(주소)정보===========
//위도 경도로 주소 검색
router.post("/reversegeo", function (req, res) {
    const lat = req.body.lat;
    const lon = req.body.lon;
    console.log('lat,lon > ',lat,lon);
    if(lat == '' || lon == ''){
        res.json({success:false,msg:null} );
    }else{
        console.log('1. 위도 경도로 검색 시작 : ' + lat + '/' + lon + ' - ', Date())
        KoreaReverseGeo(lat, lon).then((korRGeoResult) => {
            if (korRGeoResult.code == 0) {
                res.json({success:true,info:korRGeoResult.info});
                console.log('2. 위도 경도로 검색 돌려주기 완료 - ', Date())
            } else if (korRGeoResult.code == 1) {
                res.json({success:false,msg:korRGeoResult.msg} );
                console.log('2. 위도 경도로 검색 돌려주기 실패 - ', Date())
            } else {
                res.json({success:false,msg:korRGeoResult.msg} );
                console.log('2. 위도 경도로 검색 돌려주기 에러 > status : ', korRGeoResult.code, ' - ', Date())
            }
        });
    }
});


module.exports = router;


