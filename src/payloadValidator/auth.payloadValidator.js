const { check } = require('express-validator')

class AccountPayload {

	userLogin() {
		return [
			check('email')
				.not()
				.isEmpty()
				.withMessage("'email' is required")
				.isLength({ min: 6, max: 40 })
				.withMessage("'email' must be between 6 and 40 characters"),
			check('password')
				.not()
				.isEmpty()
				.withMessage("'password' is required")
				.isLength({ min: 6, max: 20 })
				.withMessage("'password' must be between 6 and 20 characters"),
		]
	}
	userSignup() {
		return [
			check('email')
				.not()
				.isEmpty()
				.withMessage("'email' is required")
				.isLength({ min: 6, max: 40 })
				.withMessage("'email' must be between 6 and 40 characters"),
			check('firstname')
				.not()
				.isEmpty()
				.withMessage("'firstname' is required")
				.isLength({ min: 1, max: 10 })
				.withMessage("'firstname' must be between 1 and 10 characters"),
			check('lastname')
				.not()
				.isEmpty()
				.withMessage("'lastname' is required")
				.isLength({ min: 1, max: 10 })
				.withMessage("'lastname' must be between 1 and 10 characters"),
			check('password')
				.not()
				.isEmpty()
				.withMessage("'password' is required")
				.isLength({ min: 6, max: 20 })
				.withMessage("'password' must be between 6 and 20 characters"),
		]
	}
}

module.exports = new AccountPayload()
