const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator');
const flash = require('connect-flash');


// const registerValidator = require('./validators/registerValidator')
// const loginValidator = require('../payloadValidator/auth.payloadValidator')

const Account = require('../models/Account')

const { SECRET_KEY_JWT } = process.env

class AuthServices {
	async userLogin(mail, password, res) {
		const account = await Account.findOne({ email: mail })
		if (!account) {
			return new Error('Tài khoản này không tồn tại')
		}
		const isMatch = await bcrypt.compare(password, account.password)

		if (!isMatch) {
			return new Error('Email hoặc mật khẩu không chính xác')
		}


		const { firstname, lastname, avatar, email, role, _id } = account
		const token = jwt.sign({ firstname, lastname, avatar, email, role, _id }, SECRET_KEY_JWT)
		
		return { token, role}
	}

	async userSignup(email, firstname, lastname, password) {
		try {
			const hashedPassword = await bcrypt.hash(password, 10);
			const account = new Account({
			  firstname,
			  lastname,
			  email,
			  role : 'user',
			  isLocked : false,
			  password: hashedPassword
			});
			await account.save();
			console.log('account created');
		  } catch (error) {
			console.log(error.message);
		}
        
	}
}

module.exports = new AuthServices()
