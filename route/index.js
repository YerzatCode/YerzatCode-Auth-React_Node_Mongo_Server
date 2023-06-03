const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const authMiddleware = require('../middleware/authMiddleware')
router.get('/users', async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Post users
router.post(
	'/register',
	[
		check('email', 'Uncorrect email').isEmail(),
		check(
			'password',
			'Password must be longer than 3 and shorter than 12'
		).isLength({ min: 3, max: 12 }),
	],
	async (req, res) => {
		try {
			console.log(req.body)
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Uncorrect request' })
			}

			const { email, password, name } = req.body

			const candidate = await User.findOne({ email })

			if (candidate) {
				return res
					.status(400)
					.json({ message: `User with email ${email} already exist` })
			}
			const hashPassword = await bcrypt.hash(password, 15)
			const user = new User({ email, name, password: hashPassword })
			await user.save()
			return res.json({ message: 'User was created' })
		} catch (error) {
			res.status(404).json({ message: error.message })
		}
	}
)

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const isPassValid = bcrypt.compareSync(password, user.password)
		if (!isPassValid) {
			return res.status(400).json({ message: 'Invalid password' })
		}

		const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
			expiresIn: '5m',
		})
		return res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		})
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
})
router.get('/auth', authMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.user.id })

		const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
			expiresIn: '5m',
		})
		return res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		})
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
})
module.exports = router
