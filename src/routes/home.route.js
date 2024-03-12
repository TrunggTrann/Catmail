const express = require('express')
const Router = express.Router()
const { authUser } = require('../middlewares/auth')


const RenderController = require('../controllers/render.controller')


Router.get('/', authUser, RenderController.show)

Router.get('/drafts', authUser, RenderController.showDrafts)

Router.get('/details', authUser, RenderController.showDetails)

Router.get('/sent-mail', authUser, RenderController.showSentMail)
Router.get('/delete', authUser, RenderController.showDeleteMail)
Router.get('/important', authUser, RenderController.showImportantMail)


Router.get('/labels/:id', authUser, RenderController.showLabels)


module.exports = Router 
