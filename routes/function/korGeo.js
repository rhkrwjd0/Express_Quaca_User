var axios = require("axios");

//
var config = {
  headers: { Authorization: "KakaoAK d9bfd85d5d91d3ba17b5754cd3c1cf31" },
};


//동 이름으로 주소 검색
var KoreaGeo = (addr) => {
  return new Promise((resolve, reject) => {
    const url =
      "https://dapi.kakao.com/v2/local/search/address.json?query=" +
      encodeURIComponent(addr);

    axios.get(url, config).then((geoResult) => {
      console.log("지역명으로 검색 > ", geoResult.data.documents);
      if (geoResult.status == 200) {
        if (geoResult.data.documents.length == 1) {
          var returnGeo = {
            lat: geoResult.data.documents[0].y,
            lon: geoResult.data.documents[0].x,
            display_name: geoResult.data.documents[0].address_name,
          };
          resolve({ code: 0, info: returnGeo });
        } else {
          var retrunGeoList = [];
          geoResult.data.documents.forEach((element) => {
            var returnGeo = {
              lat: element.y,
              lon: element.x,
              display_name: element.address_name,
            };
            retrunGeoList.push(returnGeo);
          });
          resolve({ code: 0, info: retrunGeoList });
        }
      } else {
        resolve({
          code: geoResult.status,
          msg: "지역정보를 불러올 수 없습니다.",
        });
      }
    });
  });
};

//위도 경도로 주소 검색
var KoreaReverseGeo = (lat, lon) => {
  return new Promise((resolve, reject) => {
    const url =
      "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=" +
      lon +
      "&y=" +
      lat;

    axios.get(url, config).then((r_geoResult) => {
      console.log("위도 경도로 검색 > ", r_geoResult.data.documents);
      if (r_geoResult.status == 200) {
        if (r_geoResult.data.documents.length == 1) {
          const address =
            r_geoResult.data.documents[0].address.region_1depth_name +
            " " +
            r_geoResult.data.documents[0].address.region_2depth_name +
            " " +
            r_geoResult.data.documents[0].address.region_3depth_name;
          resolve({ code: 0, info: address });
        } else {
            resolve({
                code: 1,
                msg: "위도 경도 정보가 없습니다.",
              });
        }
      } else {
        resolve({
          code: r_geoResult.status,
          msg: "위도 경도 정보를 불러올 수 없습니다.",
        });
      }
    });
  });
};

exports.KoreaGeo = KoreaGeo;
exports.KoreaReverseGeo = KoreaReverseGeo;
