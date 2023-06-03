const express = require('express')
const app = express()

const cors = require('cors')
const corsMiddleware = require('./middleware/corsMiddleware')
const MongoDB = require('./db')

require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(corsMiddleware)

const userRouter = require('./route/index')
app.use('/api', userRouter)

app.listen(process.env.PORT, () => {
	console.log(`server start in port ${process.env.PORT}`)
})
MongoDB()
