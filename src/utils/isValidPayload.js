const { validationResult } = require('express-validator')

module.exports = async (req) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return errors.errors[0].msg
	} else {
		return true
	}
}
