var moment = require('moment');
var conn = require('../components/mariaDB');
var url = require('../components/mongodb').url;
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongoose = require('mongoose');

var menuselect = (StoreId) =>{
    let StoreIdData = [StoreId];
    return new Promise((resolve, reject) => {
        console.log('Menu select 데이터 >',StoreIdData);
        var selectSql = 'SELECT StoreId,MenuId,LargeDivcd,MidDivCd,MenuName,Price,ImgUrl,OptionA,OptionB,OptionC,Contents,Best,UseYn,date_format(InsertDate, "%Y-%m-%d %H:%i") AS InsertDate FROM Menu where StoreId = '
        + '"' + StoreIdData + '"'+' and UseYn = "Y" and DelYn = "N"';
        conn.connection.query(selectSql, function (error, rows) {
            console.log('Menu select rows.length > ',rows.length);
            if(error){
                console.log("Menu select error - ", Date());
                console.log("errno > " + error.errno);
                console.log("sqlMessage > " + error.sqlMessage);
                reject({ code: error.errno, msg: error.sqlMessage,rows:rows.length });
            }else{
                if (!error && rows.length > 0) {
                    var menuData = new Object();
                    var pointDrinkItem = new Object();
                    var pointBreadItem = new Object();
                    var pointGoodsItem = new Object();

                    var arrPointdrink = new Array();
                    var arrPointbread = new Array();
                    var arrPointgoods = new Array();

                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i].LargeDivcd == 'D') {
                            pointDrinkItem = new Object();
                            pointDrinkItem.MenuId = rows[i].MenuId;
                            pointDrinkItem.MenuName = rows[i].MenuName;
                            pointDrinkItem.Price = rows[i].Price;
                            pointDrinkItem.ImgUrl = rows[i].ImgUrl;
                            pointDrinkItem.OptionA = rows[i].OptionA;
                            pointDrinkItem.OptionB = rows[i].OptionB;
                            pointDrinkItem.OptionC = rows[i].OptionC;
                            pointDrinkItem.Contents = rows[i].Contents;
                            pointDrinkItem.Best = rows[i].Best;
                            pointDrinkItem.Special = 'N';
                            arrPointdrink.push(pointDrinkItem);
                        }else if(rows[i].LargeDivcd == 'S') {
                            pointDrinkItem = new Object();
                            pointDrinkItem.MenuId = rows[i].MenuId;
                            pointDrinkItem.LargeDivcd = rows[i].LargeDivcd;
                            pointDrinkItem.MenuName = rows[i].MenuName;
                            pointDrinkItem.Price = rows[i].Price;
                            pointDrinkItem.ImgUrl = rows[i].ImgUrl;
                            pointDrinkItem.OptionA = rows[i].OptionA;
                            pointDrinkItem.OptionB = rows[i].OptionB;
                            pointDrinkItem.OptionC = rows[i].OptionC;
                            pointDrinkItem.Contents = rows[i].Contents;
                            pointDrinkItem.Best = rows[i].Best;
                            pointDrinkItem.Special = 'Y';
                            
                            arrPointdrink.push(pointDrinkItem);
                        }else if(rows[i].LargeDivcd == 'B') {
                            pointBreadItem = new Object();
                            pointBreadItem.MenuId = rows[i].MenuId;
                            pointBreadItem.MenuName = rows[i].MenuName;
                            pointBreadItem.Price = rows[i].Price;
                            pointBreadItem.ImgUrl = rows[i].ImgUrl;
                            pointBreadItem.OptionA = rows[i].OptionA;
                            pointBreadItem.OptionB = rows[i].OptionB;
                            pointBreadItem.OptionC = rows[i].OptionC;
                            pointBreadItem.Contents = rows[i].Contents;
                            pointBreadItem.Best = rows[i].Best;
                            arrPointbread.push(pointBreadItem);
                        }
                        else if(rows[i].LargeDivcd == 'G') {
                            pointGoodsItem = new Object();
                            pointGoodsItem.MenuId = rows[i].MenuId;
                            pointGoodsItem.MenuName = rows[i].MenuName;
                            pointGoodsItem.Price = rows[i].Price;
                            pointGoodsItem.ImgUrl = rows[i].ImgUrl;
                            pointGoodsItem.OptionA = rows[i].OptionA;
                            pointGoodsItem.OptionB = rows[i].OptionB;
                            pointGoodsItem.OptionC = rows[i].OptionC;
                            pointGoodsItem.Contents = rows[i].Contents;
                            pointGoodsItem.Best = rows[i].Best;
                            arrPointgoods.push(pointGoodsItem);
                        }
                    }
                    menuData.drink = arrPointdrink;
                    menuData.bread = arrPointbread;
                    menuData.goods = arrPointgoods;

                    resolve({success: true, code:0,info: menuData,rows:rows.length});
                } else if (!error && rows.length == 0) {
                    resolve({ success: false, msg: error });
                } else {
                    resolve({ success: false, msg: error });
                }
            }
        });
    });
}


exports.menuselect = menuselect
