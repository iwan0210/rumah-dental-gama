const router = require('express').Router()
const RegisterService = require('../../services/RegisterService')
const RegisterValidator = require('../../validator/RegisterValidator')
const RegisterHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')

const registerService = new RegisterService()
const registerHandler = new RegisterHandler(registerService, RegisterValidator)

router.post('/', registerHandler.postRegisterHandler)
router.get('/', verifyToken, registerHandler.getAllRegisterHandler)
router.post('/complete', verifyToken, registerHandler.postCompleteRegisterHandler)
router.get('/:id', verifyToken, registerHandler.getRegisterByIdHandler)
router.delete('/:id', verifyToken, registerHandler.deleteRegisterByIdHandler)
router.put('/:id', verifyToken, registerHandler.updateRegisterByIdHandler)

module.exports = router