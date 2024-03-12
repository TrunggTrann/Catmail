const mongoose = require('mongoose')

const AccountSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
	},
	location: {
		type: String,
	},
	password: {
		type: String,
	},
	googleId: {
		type: String,
	},
	avatar: {
		type: String,
		default:
			'/avatar/avatar-default.png',
	},
	role: {
		type: String,
		required: true
	},
	isLocked: {
		type: Boolean,
		default: false,
		required: true
	}
})
const Account = mongoose.model('Account', AccountSchema)
module.exports = Account
