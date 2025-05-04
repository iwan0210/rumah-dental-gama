const router = require('express').Router()
const RegisterService = require('../../services/RegisterService')
const RegisterValidator = require('../../validator/RegisterValidator')
const RegisterHandler = require('./controller')

const registerService = new RegisterService()
const registerHandler = new RegisterHandler(registerService, RegisterValidator)

router.post('/', registerHandler.postRegisterHandler)
router.get('/:id', registerHandler.getRegisterByIdHandler)

module.exports = router