const Config = require("../models/Config")
// kiểm tra config
 
const getConfig = async () => {
    const config = await Config.findOne();
    return config
}
// Middleware to check email size
const checkEmailSize = async (req, res, next) => {
    const attachments = req.files;
    const config = await getConfig()
    // Check if email size exceeds the max email size limit
    const emailSize = attachments.reduce((size, attachment) => size + attachment.size, 0);
    if (emailSize > config.maxEmailSize) {
      return res.status(400).json('Email size exceeds the limit.');
    }
  
    next();
};
  
// Middleware to check number of recipients
const checkRecipients = async (req, res, next) => {
    const { receiver, bcc } = req.body;
    const toArr = receiver.split(',').map(email => email.trim()); // tách các địa chỉ email và loại bỏ khoảng trắng
    let bccArr = []
    let receiverArr = []

    if(bcc == '') receiverArr = toArr
    else {
        bccArr = bcc.split(',').map(email => email.trim())
        receiverArr = toArr.concat(bccArr)
    }
    // Check if number of recipients exceeds the max recipients limit
    const numRecipients = receiverArr.length;
    const config = await getConfig()
    if (numRecipients > config.maxRecipients) {
      return res.status(400).json('Number of recipients exceeds the limit.');
    }
  
    next();
};
  
// Middleware to check number of attachments
const checkAttachments = async (req, res, next) => {
    const attachments = req.files;
    const config = await getConfig()
    // Check if number of attachments exceeds the max attachments limit
    if (attachments.length > config.maxAttachments) {
      return res.status(400).json('Number of attachments exceeds the limit.');
    }
  
    next();
};
  
// Middleware to check attachment size
const checkAttachmentSize = async (req, res, next) => {
    const attachments = req.files;
    const config = await getConfig()
    // Check if attachment size exceeds the max attachment size limit
    const maxAttachmentSize = config.maxAttachmentSize
    const oversizedAttachments = attachments.filter(attachment => attachment.size > maxAttachmentSize);
    if (oversizedAttachments.length > 0) {
      return res.status(400).json('Some attachments exceed the size limit.');
    }
  
    next();
};

module.exports = { checkEmailSize, checkAttachmentSize, checkAttachments, checkRecipients  }
