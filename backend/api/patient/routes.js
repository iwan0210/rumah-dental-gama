const router = require('express').Router()
const PatientService = require('../../services/PatientService')
const PatientValidator = require('../../validator/PatientValidator')
const PatientHandler = require('./controller')
const { verifyToken } = require('../../middleware/AuthHandler')

const patientService = new PatientService()
const patientHandler = new PatientHandler(patientService, PatientValidator)

router.post('/', verifyToken, patientHandler.postAddPatient)
router.get('/', verifyToken, patientHandler.getSearchPatient)
router.get('/search', verifyToken, patientHandler.getSearchPatientLimited)
router.get('/birth', patientHandler.getPatientByIdAndBirth)
router.get('/:id', verifyToken, patientHandler.getPatientById)
router.put('/:id', verifyToken, patientHandler.putUpdatePatient)

module.exports = router