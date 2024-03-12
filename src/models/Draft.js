const mongoose = require('mongoose')

const DraftSchema = new mongoose.Schema({
	userMail: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Account',
		required: true,
	},
	receiver: {
		type: String,
	},
	bcc: {
		type: String,
	},
    message: {
		type: String,
	},
	subject: {
		type: String,
	}
}, { timestamps: true })
const Draft = mongoose.model('Draft', DraftSchema)
module.exports = Draft
