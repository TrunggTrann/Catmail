const isValidPayload= require('../utils/isValidPayload')
const AuthServices = require('../services/auth.services')

const flash = require('connect-flash')

const { apiFailure, apiSuccess } = require('../utils/api-response')


class AuthContainer {

	async userLogin(req, res) {
		//check payload
		const isValid = await isValidPayload(req)
		if (isValid !== true) {
			
			req.flash('error', isValid);

			return res.redirect('/login');

		}

		const { email, password } = req.body
		const result = await AuthServices.userLogin(email, password)
		if (typeof result === 'string') {
			req.flash('success', 'Đăng nhập thành công!');
			return res.status(200).json(apiFailure(result))
		}
		
		return res.redirect('/login-success')
	}

	async userSignup(req, res) {
		//check payload
		const isValid = await isValidPayload(req)
		if (isValid !== true) {
			req.flash('error', isValid);
			return res.status(200).json(apiFailure(isValid))
		}

		const { email, firstname, lastname, password } = req.body
		const result = await AuthServices.userSignup(email, firstname, lastname, password)

		if (typeof result === 'string') {
			req.flash('success', 'Đăng ký tài khoản thành công!');
			return res.status(200).json(apiFailure(result))
		}

		return res.redirect('/login');
	}
}

module.exports = new AuthContainer()

