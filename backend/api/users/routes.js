const router = require('express').Router()
const tokenManager = require('../../tokenize/TokenManager')
const UsersService = require('../../services/UsersService')
const UsersValidator = require('../../validator/UsersValidator')
const UsersHandler = require('./controller')
const { verifyToken} = require('../../middleware/AuthHandler')

const usersService = new UsersService()
const usersHandler = new UsersHandler(usersService, UsersValidator, tokenManager)

router.get('/:id', verifyToken, usersHandler.getUserByIdHandler)

router.post('/Auth', usersHandler.postUserLoginHandler)

router.put('Auth/Password', verifyToken, usersHandler.putUserChangePasswordHandler)

module.exports = router