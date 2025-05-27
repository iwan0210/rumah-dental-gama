const router = require('express').Router()
const tokenManager = require('../../tokenize/TokenManager')
const UsersService = require('../../services/UsersService')
const UsersValidator = require('../../validator/UsersValidator')
const UsersHandler = require('./controller')
const { verifyToken, verifyAdminToken } = require('../../middleware/AuthHandler')

const usersService = new UsersService()
const usersHandler = new UsersHandler(usersService, UsersValidator, tokenManager)

router.post('/', verifyAdminToken, usersHandler.postUserRegisterHandler)

router.get('/', verifyAdminToken, usersHandler.getAllUsersHandler)

router.delete('/:id', verifyAdminToken, usersHandler.deleteUserByIdHandler)

router.put('/:id', verifyAdminToken, usersHandler.putUserUpdateHandler)

router.post('/Auth', usersHandler.postUserLoginHandler)

router.put('/Auth/Password', verifyToken, usersHandler.putUserChangePasswordHandler)

router.post('/Auth/Logout', verifyToken, usersHandler.postUserLogoutHandler)

module.exports = router