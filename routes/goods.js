let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('../models/goods');

//链接数据库
mongoose.connect('mongodb://127.0.0.1:27017/db_demo', {useNewUrlParser:true});

// 链接成功
mongoose.connection.on("connected", () => {
    console.log("Success");
});

// 链接失败
mongoose.connection.on("error", () => {
    console.log("fail");
});

// 断开
mongoose.connection.on("disconnected", () => {
    console.log("disconnected");
});

// 商品列表排序分页价格筛选
router.get("/list", (req, res, next) => {
    // 接收的页数参数
    let page = Number(req.param("page"));
    // 接收的页数条数
    let pageSize = Number(req.param("pageSize"));
    // 接收的排序参数
    let sort = req.param("sort");
    // 索引第几条开始
    let skip = (page - 1) * pageSize;
    // 价格阶段
    let priceLever = req.param("priceLever");
    // 大于期间
    let priceGt,priceLte = '';
    let parmas = {};

    if(priceLever !== 'all') {
        switch(priceLever) {
            case "0":
                priceGt = 0;
                priceLte = 100;
                break;
            case "1":
                priceGt = 100;
                priceLte = 500;
                break;
            case "2":
                priceGt = 500;
                priceLte = 1000;
                break;
            case "3":
                priceGt = 1000;
                priceLte = 5000;
                break;
        }
        parmas = {
            salePrice: {
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }


    // skip 是从多少开始 limit多少条 意思就是从skip开始的limit条
    let goodsModel = Goods.find(parmas).skip(skip).limit(pageSize);

    // 提供的升降序api 1是升序 2是降序
    goodsModel.sort({
        'salePrice': sort
    });

    goodsModel.exec((err, doc) => {
        if(err) {
            res.json({
                status: '1',
                msg: err.message
            })
        }else {
            res.json({
                status: '0',
                msg: '成功',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
});

// 添加购物车
router.post("/addCart", (req, res, next) => {
    let userId = '100000077', productId = req.body.productId;
    let User = require('../models/user');

    User.findOne({
      userId: userId
    },(err, userDoc) => {
        if(err) {
            res.json({
              status: "1",
              msg: err.message
            })
        }else {
            if(userDoc) {
                let goodsItem = '';
                userDoc.cardList.forEach((item) => {
                    if(item.productId == productId) {
                        goodsItem = item;
                        item.productNum ++;
                    }
                });
                if(goodsItem) {
                  userDoc.save((err2) => {
                    if(err2) {
                      res.json({
                        status: "1",
                        msg: err2.message
                      })
                    }else {
                      res.json({
                        status: "0",
                        msg: "",
                        result: "success",
                      })
                    }
                  })
                }else {
                  Goods.findOne({
                    "productId": productId
                  },(err1, doc1) => {
                    if(err1) {
                      res.json({
                        status: "1",
                        msg: err1.message
                      })
                    }else {
                      if(doc1) {
                        doc1._doc.productNum = 1;
                        doc1._doc.checked = 1;
                        userDoc.cardList.push(doc1);
                        userDoc.save((err2) => {
                          if(err2) {
                            res.json({
                              status: "1",
                              msg: err2.message
                            })
                          }else {
                            res.json({
                              status: "0",
                              msg: "",
                              result: "success",
                            })
                          }
                        })
                      }
                    }
                  })
                }
            }
        }
    })
});


module.exports = router;