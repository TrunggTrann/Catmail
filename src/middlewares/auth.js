const AccountServices = require('../services/account.services')
const { apiFailure } = require('../utils')

const getToken = async (bearerToken) => {
	if (!bearerToken) {
		return 'token not found'
	}
	const token = bearerToken.split(' ')[1]
	if (!token) {
		return 'token not found'
	}
	return token
}

const authAdmin = async (req, res, next) => {
	//get Bearer token from header

	// const bearerToken = req.headers.authorization
	const token = req.session.passport.user
	if (token === 'token not found') {
		return res.status(200).json(apiFailure(token))
	}
	//verify token
	const isValid = await AccountServices.authAdmin(token)
	if (!isValid) {
		return res.redirect('/not-authorized');
	}
	next()
}

const authUser= async (req, res, next) => {
	//get Bearer token from header
	const bearerToken = req.headers.authorization
	let token = req.session.passport.user
	// const token = req.session.user || req.session.passport.user
	if (token === 'token not found') {
		return res.status(200).json(apiFailure(token))
	}
	//verify token
	const isValid = await AccountServices.authUser(token)
	if (!isValid) {
		if (!isValid) {
			return res.redirect('/not-authorized');
		}
	}

	next()
}

module.exports = { authAdmin, authUser }