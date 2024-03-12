const mongoose = require('mongoose')
const MarkLabelSchema = new mongoose.Schema({
	labelId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Label',
		required: true,
	},
    mailId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Mail',
		required: true,
	}
})
const MarkLabel = mongoose.model('MarkLabel', MarkLabelSchema)
module.exports = MarkLabel
