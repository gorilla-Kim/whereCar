/* main Server Source */

// 환경변수를 불러옵니다.
require('dotenv').config();
const { 
  PORT: port
} = process.env;

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');

/* socket.io를 위함 */
const socketIO = require('socket.io');
const socketController = require('./socket/socketController');

/* Data 관련 */
const api = require('./api');
const db = require('./db');
const jwtMiddleware = require('./lib/middlewares/jwtMiddleware');

/* DB connention */
db.connect();

const app = new Koa();

app.use(helmet());
app.use(jwtMiddleware);
app.use(bodyParser());

const router = new Router();
/* /... */
router.use('/api', api.routes());

// middleware
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(port, () => {
  console.log(`✅  heurm server is listening http://localhost:${port}`);
});

// io가 모든 이벤트를 알아야 하기 때문에 아래와같이 사용합니다.
const io = socketIO.listen(server);

// create connection event
io.on('connection', socket => socketController(socket, io));