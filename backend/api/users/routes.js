const router = require('express').Router()
const tokenManager = require('../../tokenize/TokenManager')
const UsersService = require('../../services/UsersService')
const UsersValidator = require('../../validator/UsersValidator')
const UsersHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')
const csrf = require('csurf')

const csrfProtection = csrf()

const usersService = new UsersService()
const usersHandler = new UsersHandler(usersService, UsersValidator, tokenManager)

router.post('/', verifyToken(['admin']), csrfProtection, usersHandler.postUserRegisterHandler)
router.get('/', verifyToken(['admin']), usersHandler.getAllUsersHandler)
router.delete('/:id', verifyToken(['admin']), csrfProtection, usersHandler.deleteUserByIdHandler)
router.put('/:id', verifyToken(['admin']), csrfProtection, usersHandler.putUserUpdateHandler)
router.post('/Auth', usersHandler.postUserLoginHandler)
router.put('/Auth/Password', verifyToken(), csrfProtection, usersHandler.putUserChangePasswordHandler)
router.post('/Auth/Logout', verifyToken(), csrfProtection, usersHandler.postUserLogoutHandler)

module.exports = router