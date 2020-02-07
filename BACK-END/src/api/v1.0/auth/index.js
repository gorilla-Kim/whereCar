const Router = require('koa-router'); 

const auth = new Router();
const authCtrl = require('./auth.ctrl');

/* /api/v1.0/auth */
auth.get('/', (ctx) => {
  ctx.body = '✅ Welcome to auth!!';
});
auth.post('/register/local', authCtrl.localRegister);
auth.post('/login/local', authCtrl.localLogin);

module.exports = auth;