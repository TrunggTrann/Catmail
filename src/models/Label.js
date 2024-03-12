const mongoose = require('mongoose')

const LabelSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        unique: true,
	},
	hide: {
		type: Boolean,
		required: true,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Account'
	}
})
const Label = mongoose.model('Label', LabelSchema)
module.exports = Label
