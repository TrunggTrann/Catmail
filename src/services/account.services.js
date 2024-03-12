const jwt = require('jsonwebtoken')

const auth = async (token, lv) => {
	try {
		const { role } = jwt.decode(token)
		if (role !== lv) {
			return false
		}
	} catch (error) {
		console.log(error)
		return false
	}

	return true
}

class AccountServices {
	
	async authAdmin(token) {
		return auth(token, 'admin')
	}

	async authUser(token) {
		return auth(token, 'user')
	}

	
}

module.exports = new AccountServices()
