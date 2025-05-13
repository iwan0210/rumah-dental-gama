const router = require('express').Router()

const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()

router.get('/', async (_, res) => {
    try {
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        const data = await registerService.getStatistics()
        res.render('home', { title: 'Home', defaultDate, ...data })
    } catch (error) {
        res.status(404).render(404, { title: 'Error'})
    }
})

router.get('/finance', async (_, res) => {
    try {
        const data = await registerService.getFinance()
        res.render('finance', { title: 'Keuangan', ...data })
    } catch (error) {
        res.status(404).render(404, { title: 'Error'})
    }
})

router.get('/add', (_, res) => {
    res.render('add-data', { title: 'Tambah Data' })
})

router.get('/edit/:id', async (req, res) => {
    try {
        const data = await registerService.getRegisterById(req.params.id)
        res.render('edit-data', { title: 'Edit Data', ...data })
    } catch (error) {
        res.status(404).render(404, { title: 'Error'})
    }
})

router.get('/login', (_, res) => {
    res.render('login', { title: 'Login' })
})

module.exports = router