const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
	fileName: {
		type: String,
		required: true,
	},
	filePath: {
		type: String,
		required: true,
	}
}, { collection: 'file' })
const File = mongoose.model('File', FileSchema)
module.exports = File
