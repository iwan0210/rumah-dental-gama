const router = require('express').Router()
const QueueSessionService = require('../../services/QueueSessionService')
const QueueSessionValidator = require('../../validator/QueueSessionValidator')
const QueueSessionHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')
const csrf = require('csurf')

const csrfProtection = csrf()

const queueSessionService = new QueueSessionService()
const queueSessionHandler = new QueueSessionHandler(queueSessionService, QueueSessionValidator)

router.get('/', verifyToken(['admin']), queueSessionHandler.getAllQueueSessions)
router.get('/active', queueSessionHandler.getAllActiveQueueSessions)
router.get('/:id', verifyToken(['admin']), queueSessionHandler.getQueueSessionById)
router.post('/', verifyToken(['admin']), csrfProtection, queueSessionHandler.inserQueueSession)
router.put('/:id', verifyToken(['admin']), csrfProtection, queueSessionHandler.updateQueueSession)
router.patch('/:id', verifyToken(['admin']), csrfProtection, queueSessionHandler.UpdateStatusQueueSession)

module.exports = router