const express = require('express');
const Router = express.Router();

const MailController = require('../controllers/mail.controller');  
const { checkEmailSize, checkRecipients, checkAttachments, checkAttachmentSize } = require("../middlewares/checkConfig")
const { checkBadKeyword } = require("../middlewares/checkBadKeyword")
const { checkAccountFound } = require("../middlewares/checkAccount")

const { uploadItems } = require('../middlewares/upload')

Router.post('/compose', uploadItems.array('item'), checkAccountFound, checkEmailSize, checkRecipients, checkAttachments, checkAttachmentSize, checkBadKeyword, MailController.compose)
Router.post('/forward', uploadItems.array('item'), checkAccountFound, checkEmailSize, checkRecipients, checkAttachments, checkAttachmentSize, checkBadKeyword, MailController.forward)
Router.get('/:id', MailController.getMail);
Router.get('/', MailController.getAllMails);

Router.put('/:id', MailController.readMail);
Router.put('/delete/:id/:message', MailController.deleteTempMail);
Router.delete('/delete/:id', MailController.deleteMail);
Router.delete('/unsend/:id', MailController.unsendMail);
Router.put('/important/:id/:message', MailController.checkImportantMail);

module.exports = Router 
