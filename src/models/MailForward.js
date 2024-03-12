const mongoose = require('mongoose')
const MailForwardSchema = new mongoose.Schema({
	parent_mail: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Mail',
		required: true,
	},
    sender: {
		_id: { 
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
			required: true,
		}, 
		isRead: {
			type: Boolean,
			default: true
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		isImportant: {
			type: Boolean,
			default: false
		}
	},
	receiver: [{ 
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
			required: true
		},
		isRead: {
			type: Boolean,
			default: false
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		isImportant: {
			type: Boolean,
			default: false
		}
	}],
	bcc: [{ 
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
		},
		isRead: {
			type: Boolean,
			default: false
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		isImportant: {
			type: Boolean,
			default: false
		}
	}],
    message: {
		type: String,
	},
	subject: {
		type: String,
	},
	attachments: [{
		id: { type: String },
		originalName: { type: String },
		contentType: { type: String },
		fileName: { type: String },
		size: { type: Number },
	}],
    date: {
		type: Date,
		default: Date.now
	}
})
const MailForward = mongoose.model('MailForward', MailForwardSchema)
module.exports = MailForward