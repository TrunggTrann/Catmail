const express = require('express')
const multer = require('multer');
const Router = express.Router()

const AccountController = require('../controllers/account.controller')
const AuthPayload = require('../payloadValidator/auth.payloadValidator')
const { authUser } = require('../middlewares/auth')
const { uploadAvatar } = require('../middlewares/upload')

//Update user
Router.post('/update/:id', authUser, AccountController.updateUser)
Router.post('/update-avatar/:id', authUser, uploadAvatar.single('avatar'), AccountController.updateAvatar)

//Drafts
Router.post('/drafts/:userId/:id', authUser, AccountController.getDraft)
Router.put('/drafts/:userId/:id', authUser, AccountController.updateDraft)
Router.delete('/drafts/:userId/:id', authUser, AccountController.deleteDraft)

Router.post('/drafts/:userId', authUser, AccountController.getAllDrafts)
Router.post('/drafts', authUser, AccountController.createDrafts)
//Labels
Router.post('/labels/mail/:mailId', authUser, AccountController.createLabelMail) //Gắn nhãn cho mail

Router.delete('/labels/:userId/:id', authUser, AccountController.deleteLabel)
Router.post('/labels/:userId', authUser, AccountController.getAllLabels)
Router.post('/labels', authUser, AccountController.createLabels)

//User
Router.get('/:id', AuthPayload.userLogin(), AccountController.getUser)
Router.post('/logout', AccountController.logOut)

module.exports = Router
