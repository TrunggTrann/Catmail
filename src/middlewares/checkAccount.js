const jwt = require('jsonwebtoken')
const Account = require('../models/Account')
//Kiem tra tai khoan da dang nhap chua
function requireLogin(req, res, next) {
    if (req.session.passport && req.session.passport.user) {
      next();
    } else {
      if (req.originalUrl === '/admin') {
        res.redirect('/admin/login');
      } else {
        res.redirect('/login');
      }
    }
}
//Chuyen route neu la admin
function redirectAccount(req, res, next) {
    const { role } = jwt.decode(req.session.passport.user)
    if (role === 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/');
      }
}
// Kiểm tra trạng thái của tài khoản người dùng trước khi cho phép truy cập vào tính năng
function isAccountLocked(req, res, next) {
    const { isLocked } = jwt.decode(req.session.passport.user) // Lấy thông tin người dùng từ middleware xác thực
    if (isLocked) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
    }
    next();
}
//Kiểm tra user có tồn tại hay không
const checkAccountFound = async(req, res, next) => {
  const { receiver, bcc } = req.body;
  const toArr = receiver.split(',').map(email => email.trim()); // tách các địa chỉ email và loại bỏ khoảng trắng
  let bccArr = []
  let receiverArr = []

  if(bcc == '') receiverArr = toArr
  else {
      bccArr = bcc.split(',').map(email => email.trim())
      receiverArr = toArr.concat(bccArr)
  }
  
  // Tìm kiếm người dùng trong MongoDB bằng email
  const users = await Account.find({ email: { $in: receiverArr } }).exec();
  if (!users || users.length === 0) {
      return res.status(400).json("Users not found");
  }

  const userMap = {};
  users.forEach(function (user) {
      userMap[user.email] = user._id;
  });
  // Lấy được các id của người gửi và xứ lý lỗi trả về nếu người gửi đó không tồn tại
  toArr.map((email) => {
      const userId = userMap[email];
      if (!userId) {
          hasSentHeaders = true;
          return res.status(400).json(`User with email ${email} not found`);          
      }       
  });
  
  let bccId = []
  if (bccArr.length > 0) {
      bccId = bccArr.map((email) => {
          const userId = userMap[email];
          if (!userId) {
              return res.status(400).json(`User with email ${email} not found`); 
          }
      });
  }
  next();
}

module.exports = { requireLogin, redirectAccount, isAccountLocked, checkAccountFound}