const router = require('express').Router()
const ScheduleService = require('../../services/ScheduleService')
const ScheduleValidator = require('../../validator/ScheduleValidator')
const ScheduleHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')
const csrf = require('csurf')

const csrfProtection = csrf()

const scheduleService = new ScheduleService()
const scheduleHandler = new ScheduleHandler(scheduleService, ScheduleValidator)

router.get('/', verifyToken(['admin']), scheduleHandler.getAllSchedule)
router.get('/active/:date', scheduleHandler.getActiveScheduleByDayName)
router.get('/:id', verifyToken(['admin']), scheduleHandler.getActiveScheduleById)
router.post('/', verifyToken(['admin']), csrfProtection, scheduleHandler.insertSchedule)
router.put('/:id', verifyToken(['admin']), csrfProtection, scheduleHandler.updateSchedule)
router.patch('/:id', verifyToken(['admin']), csrfProtection, scheduleHandler.UpdateScheduleStatus)

module.exports = router