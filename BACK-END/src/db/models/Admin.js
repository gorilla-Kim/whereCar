const mongoose = require('mongoose');
const { PASSWORD_HASH_KEY: secret } = process.env;
const crypto = require('crypto');
const token = require('lib/token');

// 사용법: console.log(hash('1234'));
const hash = (password) => crypto.createHmac('sha256', secret).update(password).digest('hex');

const Admin = new mongoose.Schema({
  groupName: String,
  groupAddress: String,
  Role: String,
  user: { // 해당 Admin을 사용하는 User
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminGroup: { // 해당 Admin이 속해있는 AdminGroup정보
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminGroup'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', Admin);