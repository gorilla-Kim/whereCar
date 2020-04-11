const Joi = require('joi');
const User = require('db/models/User');
const GroupInfo = require('db/models/GroupInfo');
const CarInfo = require('db/models/CarInfo');
const Course = require('db/models/Course');
const Admin = require('db/models/Admin');

// 그룹에 속한 유저들 정보가져오기, 그룹에 대한 관리자권한만 접근
exports.groupUsers = async (ctx) => {
  const { user } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  }
  // GroupInfo DB에서 유저들정보 가져오기.
  try {
    const group = await GroupInfo.findOne({ _id: admin.group });
    ctx.body = {
      groupUsers: group.users,
      admin: admin
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 그룹에 속해있는 매니저들 찾아오기.
exports.groupManagers = async (ctx) => {
  const { user } = ctx.request;

  try {
    // find admin
    const admin = await Admin.findByUser(user);
    // find GroupInfo
    const groupInfo = await GroupInfo.findOne({ _id: admin.group });
    // user session또는 관리자 권한이 없다면
    if(!user || !admin) {
      ctx.status = 403;
      ctx.body = 'Any session not founded!';
      // eslint-disable-next-line no-useless-return
      return;
    }
    // response message(=data)
    ctx.body = {
      Users: await User.findByIds(groupInfo.users),
      Drivers: await User.findByIds(groupInfo.drivers)
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 그룹원들 역할 수정하기 찾아오기.
exports.updateManagers = async (ctx) => {
  const { user, body } = ctx.request;
  try {
    // find admin
    const admin = await Admin.findByUser(user);
    // user session또는 관리자 권한이 없다면
    if(!user || !admin) {
      ctx.status = 403;
      ctx.body = 'Any session not founded!';
      // eslint-disable-next-line no-useless-return
      return;
    }
    // find GroupInfo
    const groupInfo = await GroupInfo.findOne({ _id: admin.group });

    let { users, drivers } = groupInfo;
    const { Users, Drivers } = body;
    
    const beforeMembers = Users.concat(Drivers);
    for (const i in body) {
      if(i === 'Users') {
        const rest = users.filter(value => beforeMembers.indexOf(value) !== -1);
        users = [...rest, ...body[i]];
      } else {
        const rest = drivers.filter(value => beforeMembers.indexOf(value) !== -1);
        drivers = [...rest, ...body[i]];
      }
    }
    // update query 날리기
    await GroupInfo.updateManagers({ _id: groupInfo._id, users, drivers });
    // response message(=data)
    ctx.body = {
      managers: {
        Users: groupInfo.users,
        Drivers: groupInfo.drivers
      }
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 그룹에 속해있는 드라이버 찾아오기.
exports.groupDrivers = async (ctx) => {
  const { user } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  }
  try {
    
  } catch (error) {
    ctx.throw(error);
  }
};

// 특정그룹에서 자동차 등록하기
exports.carRegister = async (ctx) => {
  // const { user, body } = ctx.request;
  const { user, body, file } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  };

  // body에서 받은정보 validation하기
  const schema = Joi.object({
    carName: Joi.string().min(2).max(30).required(),
    carNumber: Joi.string().min(4).max(30),
    seatNumber: Joi.number(),
    inspectionDate: Joi.date()
  });

  const result = Joi.validate(body, schema);
  // Schema error 
  if(result.error) {
    console.log('🔥Schema error', result.error);
    ctx.status = 400;
    ctx.body = 'Schema error';
    // eslint-disable-next-line no-useless-return
    return;
  }
  // recieved Client request data
  const { carName, carNumber, seatNumber, inspectionDate } = body;
  try {
    const carInfo = await CarInfo.carRegister({
      carName,
      carNumber,
      seatNumber,
      inspectionDate,
      carImageUrl: file ? file.path : null,
      group: admin.group
    });
    // response message(=data)
    ctx.body = {
      carInfo
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 특정그룹의 특정자동차 업데이트하기
exports.carUpdate = async (ctx) => {
  const { user, body, file } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  };

  // body에서 받은정보 validation하기
  const schema = Joi.object({
    carId: Joi.string(),
    carName: Joi.string().min(2).max(30).required(),
    carNumber: Joi.string().min(4).max(30),
    seatNumber: Joi.number(),
    inspectionDate: Joi.date()
  });

  const result = Joi.validate(body, schema);
  // Schema error 
  if(result.error) {
    console.log('🔥Schema error', result.error);
    ctx.status = 400;
    ctx.body = 'Schema error';
    // eslint-disable-next-line no-useless-return
    return;
  }
  // recieved Client request data
  const { carId, carName, carNumber, seatNumber, inspectionDate, carImageUrl } = body;
  try {
    const carInfo = await CarInfo.carUpdate({
      _id: carId,
      carName,
      carNumber,
      seatNumber,
      inspectionDate,
      carImageUrl: file ? file.path : carImageUrl
    });
    // response message(=data)
    ctx.body = {
      carInfo
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 그룹에 속해있는 드라이버 찾아오기.
exports.carDelete = async (ctx) => {
  const { user } = ctx.request;
  const { id } = ctx.params;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  }
  try {
    const result = await CarInfo.removeById({ _id: id });
    // response message(=data)
    ctx.body = {
      result
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 특정그룹에서 운전코스 등록하기
exports.courseRegister = async (ctx) => {
  const { user, body } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  };

  // body에서 받은정보 validation하기
  const schema = Joi.object({
    courseName: Joi.string().min(2).max(30).required(),
    stations: Joi.array().items(
      Joi.object({
        stationName: Joi.string(),
        Longitude: Joi.number(),
        Latitude: Joi.number()
      })
    )
  });

  const result = Joi.validate(body, schema);
  // Schema error 
  if(result.error) {
    console.log('🔥Schema error', result.error);
    ctx.status = 400;
    ctx.body = 'Schema error';
    // eslint-disable-next-line no-useless-return
    return;
  }
  // recieved Client request data
  const { courseName, stations } = body;
  try {
    const courseInfo = await Course.courseRegister({
      courseName,
      stations,
      group: admin.group
    });
    // response message(=data)
    ctx.body = {
      courseInfo
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 특정그룹에서 운전코스 수정하기
exports.courseUpdate = async (ctx) => {
  const { user, body } = ctx.request;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  };

  // body에서 받은정보 validation하기
  const schema = Joi.object({
    courseId: Joi.string(),
    courseName: Joi.string().min(2).max(30).required(),
    stations: Joi.array().items(
      Joi.object({
        stationName: Joi.string(),
        Longitude: Joi.number(),
        Latitude: Joi.number()
      })
    )
  });

  const result = Joi.validate(body, schema);
  // Schema error 
  if(result.error) {
    console.log('🔥Schema error', result.error);
    ctx.status = 400;
    ctx.body = 'Schema error';
    // eslint-disable-next-line no-useless-return
    return;
  }
  // recieved Client request data
  const { courseName, stations, courseId } = body;
  try {
    const courseInfo = await Course.carUpdateById({
      _id: courseId,
      courseName,
      stations
    });
    // response message(=data)
    ctx.body = {
      courseInfo
    };
  } catch (error) {
    ctx.throw(error);
  }
};

// 그룹에 속해있는 드라이버 찾아오기.
exports.courseDelete = async (ctx) => {
  const { user } = ctx.request;
  const { id } = ctx.params;
  // find admin
  const admin = await Admin.findByUser(user);
  // user session또는 관리자 권한이 없다면
  if(!user || !admin) {
    ctx.status = 403;
    ctx.body = 'Any session not founded!';
    // eslint-disable-next-line no-useless-return
    return;
  }
  try {
    const result = await Course.removeById({ _id: id });
    // response message(=data)
    ctx.body = {
      result
    };
  } catch (error) {
    ctx.throw(error);
  }
};
