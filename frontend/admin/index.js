const router = require('express').Router()

const { render } = require('ejs');
const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()

const getCurrentDateInWIB = () => {
    const wib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return wib.getFullYear() + '-' + String(wib.getMonth() + 1).padStart(2, '0') + '-' + String(wib.getDate()).padStart(2, '0');
}

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

router.get('/patient', (_, res) => {
    res.render('patient', { title: 'Rekap Pasien' })
})

router.get('/add', (_, res) => {
    res.render('add-data', { title: 'Tambah Data' })
})

router.get('/edit/:id', async (req, res) => {
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