const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/weixin', {
  userNewUrlParser: true,
}, () => {
  console.log('Mongodb connected ...');
});

scheme = new Schema({
  access_token: String,
  expires_in: Number,
  refresh_token: String,
  openid: String,
  scope: String,
  create_at: String,
});

// 自定义getToken方法
scheme.statics.getToken = async function (openid) {
  return await this.findOne({
    openid: openid
  });
};

scheme.statics.setToken = async function (openid, token) {
  // 有则更新，无则添加
  const query = {
    openid: openid,
  };
  const options = {
    upsert: true,
  }
  return await this.updateOne(query, token, options);
};

exports.ClientToken = mongoose.model('ClientToken', scheme)