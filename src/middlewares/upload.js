const multer = require("multer")
const uuid = require('uuid');

const renameFile = (req, file, callback) => {
    const originalName = file.originalname; // lấy tên file gốc
    const extension = originalName.split('.').pop(); // lấy đuôi file
    const id = uuid.v4();
    const newFileName = `${id}.${extension}`; // đổi tên file thành ID của mail
    callback(null, newFileName); // trả về tên file mới
};
  
const storageItems = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/')
    },
    filename: renameFile
});
const storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/avatar')
    },
    filename: renameFile
});
const uploadItems = multer({
    storage: storageItems,
    limits: { fileSize: 1000000000 }, 
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
})
const uploadAvatar = multer({
    storage: storageAvatar,
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
})
module.exports = { uploadItems, uploadAvatar }