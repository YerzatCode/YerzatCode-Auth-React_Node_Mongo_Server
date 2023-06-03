const mongoose = require('mongoose')

function connect() {
	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
	const db = mongoose.connection
	db.on('error', (error) => console.log(error))
	db.once('open', () => console.log('connection to db established'))
}
module.exports = connect
