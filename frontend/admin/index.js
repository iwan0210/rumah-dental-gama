const router = require('express').Router()

const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()

const getCurrentDateInWIB = () => new Date().toLocaleDateString('sv-SE')

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    try {
        const defaultDate = getCurrentDateInWIB()
        const data = await registerService.getStatistics()
        res.render('home', { title: 'Home', defaultDate, ...data, user: req.session.user })
    } catch (error) {
        console.log(error)
        res.status(500).render('500', { title: 'Error' })
    }
})

router.get('/finance', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    try {
        const data = await registerService.getFinance()
        res.render('finance', { title: 'Keuangan', ...data, user: req.session.user })
    } catch (error) {
        res.status(404).render('500', { title: 'Error' })
    }
})

router.get('/patient/monthly', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    res.render('patient-monthly', { title: 'Rekap Pasien', user: req.session.user })
})

router.get('/patient/daily', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    const defaultDate = getCurrentDateInWIB()
    res.render('patient-daily', { title: 'Rekap Pasien', defaultDate, user: req.session.user })
})

router.get('/patient/search', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('search', { title: 'Pencarian Pasien', user: req.session.user })
})

router.get('/patient/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('add-data', { title: 'Tambah Data', user: req.session.user })
})

router.get('/patient/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    try {
        const data = await registerService.getRegisterById(req.params.id)
        res.render('edit-data', { title: 'Edit Data', ...data, user: req.session.user })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
    }
})

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin')
    }

    res.render('login', { title: 'Login' })
})

module.exports = router