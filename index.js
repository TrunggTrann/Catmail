const express = require('express')

const initDatabase = require('./src/configs/db')
const setMiddleware = require('./src/configs/middleware')
const setRoutes = require('./src/routes')

const app = express()

setMiddleware(app)
setRoutes(app)
initDatabase.conect()



const { PORT } = process.env || 3000
console.log(PORT)
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
