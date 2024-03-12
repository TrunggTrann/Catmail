const express = require('express')

const AdminController = require('../controllers/admin.controller')
const { authAdmin } = require('../middlewares/auth')

const Router = express.Router()

//Render các trang mà admin quản lý
Router.get('/', authAdmin, AdminController.show)
Router.get('/user', authAdmin, AdminController.showUsers)
Router.get('/config', authAdmin, AdminController.showConfigs)
Router.get('/badKeyword', authAdmin, AdminController.showBadKeywords)

//Admin sẽ có các quyền: lock, unlock user; config mail, badKeyword
Router.put('/user/:id/lock', authAdmin, AdminController.lockUser)
Router.put('/user/:id/unlock', authAdmin, AdminController.unlockUser)
Router.delete('/user/:id', authAdmin, AdminController.deleteUser)
Router.get('/users', authAdmin, AdminController.getAllUsers)

Router.get('/configs', authAdmin, AdminController.getConfig)
Router.post('/configs', authAdmin, AdminController.createConfig)

Router.get('/badKeywords', authAdmin, AdminController.getBadKeyword)
Router.post('/badKeywords', authAdmin, AdminController.createBadKeyword)
Router.delete('/badKeywords/:id', authAdmin, AdminController.deleteBadKeyword)

module.exports = Router
