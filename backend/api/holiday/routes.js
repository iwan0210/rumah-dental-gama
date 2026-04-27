const router = require('express').Router()
const HolidayService = require('../../services/HolidayService')
const HolidayValidator = require('../../validator/HolidayValidator')
const HolidayHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')
const csrf = require('csurf')

const csrfProtection = csrf()

const holidayService = new HolidayService()
const holidayHandler = new HolidayHandler(holidayService, HolidayValidator)

router.get('/', verifyToken, holidayHandler.getAllHolidays)
router.get('/:date', holidayHandler.getHolidayByDate)
router.post('/', verifyToken, csrfProtection, holidayHandler.postHoliday)
router.put('/:date', verifyToken, csrfProtection, holidayHandler.putHoliday)
router.delete('/:date', verifyToken, csrfProtection, holidayHandler.deleteHoliday)

module.exports = router