let express = require('express');
let router = express.Router();

let User = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登陆
router.post("/login", (req, res, next) => {
  let userParma = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(userParma, (err, doc) => {
    if(err) {
      res.json({
        status: '1',
        msg: err.message
      })
    }else if(doc == null) {
      res.json({
        status: '1',
        msg: '账号密码不存在'
      })
    }else {
      if(doc) {
        res.cookie("userId",doc.userId, {
          path: '/',
          maxAge: 1000*60*60
        });
        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000*60*60
        });
        // req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
});

// 登出
router.post("/loginOut", (req, res, next) => {
  res.cookie("userId", "", {
    path: '/',
    maxAge: -1
  })

  res.json({
    status: "0",
    msg: '',
    result: 'logoutSuccess'
  })
});

// 用户刷新页面让前台数据保持不变。
router.get("/checkLogin", (req, res, next) => {
  if(req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  }else {
    res.json({
      status: '10001',
      msg: '未登陆',
      result: ''
    })
  }
});

// 获取当前用户的购物车数据
router.get("/cardList", (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({userId}, (err, doc) => {
    if(err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else {
      if(doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cardList
        })
      }
    }
  });
});

// 购物车删除其中的一项商品
router.post("/cardDel", (req, res, next) => {
  let userId = req.cookies.userId, productId = req.body.productId;
  User.update({
    userId
  },{
    $pull:{
      'cardList':{
        productId
      }
    }
  }, (err,doc) => {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  });
});

// 购物车其中的一项商品的个数
router.post("/cardEdit", (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId,
    checked = req.body.checked,
    productNum = req.body.productNum;

  User.update({
    userId,
    "cardList.productId": productId}, {
      "cardList.$.productNum": productNum,
      'cardList.$.checked': checked
    }, (err, doc) => {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })


});
module.exports = router;
