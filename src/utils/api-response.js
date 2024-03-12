const apiSuccess = (data) => {
	return {
		status: 'success',
		data,
	}
}

const apiFailure = (message) => {
	return {
		status: 'failure',
		message,
	}
}

module.exports = { apiSuccess, apiFailure }