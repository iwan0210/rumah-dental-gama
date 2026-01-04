const router = require('express').Router()
const HolidayService = require('../../services/HolidayService')
const HolidayValidator = require('../../validator/HolidayValidator')
const HolidayHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')

const holidayService = new HolidayService()
const holidayHandler = new HolidayHandler(holidayService, HolidayValidator)

router.get('/', verifyToken, holidayHandler.getAllHolidays)
router.get('/:date', holidayHandler.getHolidayByDate)
router.post('/', verifyToken, holidayHandler.postHoliday)
router.put('/:date', verifyToken, holidayHandler.putHoliday)
router.delete('/:date', verifyToken, holidayHandler.deleteHoliday)

module.exports = router