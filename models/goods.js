var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 创建模型
var produtSchema = new Schema({
    "productId": String,
    "productName": String,
    "checked": String,
    "salePrice": Number,
    "productImage": String
});

// 输出商品模型
module.exports = mongoose.model('Good', produtSchema);
