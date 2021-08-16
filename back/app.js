const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const querystring = require('querystring');
const app = new Koa();
const router = new Router();
const compress = require('koa-compress');
const options = {
  threshold: 2048
};
app.use(compress(options));
app.use(bodyParser());
const conf = require('./conf');

// const {
//   Quiz,
//   ClientToken,
//   ServerToken,
// } = require('./mongoose');

// 静态文件
const static = require('koa-static');
// app.use(static('../cube-ui/dist'));
app.use(static('../front/dist'));

const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const secret = 'helloclivia';
app.use(jwt({
  secret,
})
  .unless({
    path: [/\/wxAuthorize/, /\/wxCallback/]
  })
);

const WechatAPI = require('co-wechat-api');
const api = new WechatAPI(conf.appid, conf.appsecret);
const OAuth = require('co-wechat-oauth');
const oauth = new OAuth(conf.appid, conf.appsecret);

router.get('/wxAuthorize', async (ctx, next) => {
  console.log('/wxAuthorize')
  const state = '';
  console.log('ctx...' + ctx.href);
  // 目标地址
  redirectUrl = ctx.href.replace('wxAuthorize', 'wxCallback');
  // redirectUrl = redirectUrl.replace(':8000', '');
  redirectUrl = redirectUrl.replace('localhost:4000', 'clivia.free.idcfengye.com/api');
  const scope = 'snsapi_userinfo';
  console.log('redirectUrl:', redirectUrl);
  const url = oauth.getAuthorizeURL(redirectUrl, state, scope);
  console.log('url:', url);
  ctx.redirect(url);
});

// 获取 Openid 和 AccessToken
router.get('/wxCallback', async (ctx, next) => {
  const { code, openid } = ctx.query;
  console.log('getAccessToken', code);
  const token = await oauth.getAccessToken(code);
  // 自身的登录态 jwt模式
  console.log(token, 'token;')
  const sign = jsonwebtoken.sign({
    data: token,
    // 设置 token 过期时间
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 60 seconds
  }, secret);
  const qs = querystring.stringify({
    token: sign,
    openid: token.data.openid,
  });

  const url = `/index.html?${qs}`;
  console.log('wxCallback url', url);
  ctx.redirect(url);
});

router.get('/getUser', async (ctx, next) => {
  const openid = ctx.query.openid;
  console.log('getUser', openid)
  const userInfo = await oauth.getUser(openid);
  console.log('userInfo', userInfo);
  ctx.body = userInfo;
});

const { questions } = require('./data');
router.get('/getData', async (ctx, next) => {
  ctx.body = questions;
});

router.get('/getJSConfig', async(ctx, next) => {
  console.log('getJSSDK...', ctx.query);
  const res = await api.getJsConfig(ctx.query);
  ctx.body = res;
})


// 调用router.routes()来组装匹配好的路由，返回一个合并好的中间件
app.use(router.routes());


app.listen(4000, () => {
  console.log('Listening to Port 4000...');
})
// app.listen(3000, () => {
//   console.log('Listening to Port 3000...');
// })



