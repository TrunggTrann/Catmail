const express = require('express')

const AuthController = require('../controllers/auth.controller')
const AuthPayload = require('../payloadValidator/auth.payloadValidator')

const Router = express.Router()
const passport = require("passport")
require("../configs/passport")

// Router.post('/login', AuthPayload.userLogin(), AuthController.userLogin)
Router.post('/signup', AuthPayload.userSignup(), AuthController.userSignup)

// Xử lý đăng nhập với Local Strategy
// // Voi User
Router.post("/login", passport.authenticate("user-local", {
    successRedirect: "/login-success",
    failureRedirect: "/login"
}));
// // Voi Admin
Router.post("/login/admin", passport.authenticate("admin-local", {
    successRedirect: "/login-success",
    failureRedirect: "/admin/login"
}));
// Xử lý đăng nhập với Google
Router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

Router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "/login-success",
    failureRedirect: "/login"
}));
// Router.post('/compose', AuthController.createMail)
// Router.get('/',function(req, res) {
//     console.log(req.session.mails)
//     res.render('home',{mails: req.session.mails})
// })




module.exports = Router
