const router = require('express').Router()

const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()

const getCurrentDateInWIB = () => new Date().toLocaleDateString('sv-SE')

router.get('/', async (_, res) => {
    try {
        const defaultDate = getCurrentDateInWIB()
        const data = await registerService.getStatistics()
        res.render('home', { title: 'Home', defaultDate, ...data })
    } catch (error) {
        console.log(error)
        res.status(404).render('500', { title: 'Error' })
    }
})

router.get('/finance', async (_, res) => {
    try {
        const data = await registerService.getFinance()
        res.render('finance', { title: 'Keuangan', ...data })
    } catch (error) {
        res.status(404).render('500', { title: 'Error' })
    }
})

router.get('/patient/monthly', (_, res) => {
    res.render('patient-monthly', { title: 'Rekap Pasien' })
})

router.get('/patient/daily', (_, res) => {
    const defaultDate = getCurrentDateInWIB()
    res.render('patient-daily', { title: 'Rekap Pasien', defaultDate })
})

router.get('/patient/search', (_, res) => {
    res.render('search', { title: 'Pencarian Pasien' })
})

router.get('/patient/add', (_, res) => {
    res.render('add-data', { title: 'Tambah Data' })
})

router.get('/patient/edit/:id', async (req, res) => {
    try {
        const data = await registerService.getRegisterById(req.params.id)
        res.render('edit-data', { title: 'Edit Data', ...data })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
    }
})

router.get('/login', (_, res) => {
    res.render('login', { title: 'Login' })
})

module.exports = router