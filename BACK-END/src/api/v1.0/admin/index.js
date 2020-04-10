const Router = require('koa-router'); 
const uploader = require('lib/multerUploader');

const admin = new Router();
const adminCtrl = require('./admin.ctrl');

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    // rejects storing a file
    cb(null, false);
  }
};
// file 업로드를 위함 ( 저장위치 : uploads/ 폴더 )
const upload = uploader.createUploader({ dir: 'uploads/car', limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

/* /api/v1.0/admin */
admin.get('/', (ctx) => {
  ctx.body = '✅ Welcome to admin!!';
});

// 그룹에 속한 유저들 확인하기
admin.get('/users', adminCtrl.groupUsers);

// 그룹에 속한 매니저들 확인하기
admin.get('/managers', adminCtrl.groupManagers);

// 매니저권한 새로부여 및 수정
admin.post('/managers', adminCtrl.updateManagers);

// 자동차 등록 
admin.post('/car/register', upload.single('carImage'), adminCtrl.carRegister);

// 자동차 수정
admin.put('/car', upload.single('carImage'), adminCtrl.carUpdate);

// 자동차 삭제 
admin.delete('/car/:id', adminCtrl.carDelete);

// 자동차리스트 가져오기 [김성현군 작성바람]
admin.get('/cars', (ctx) => {
  ctx.body = '✅ Welcome to admin!!';
});



module.exports = admin;