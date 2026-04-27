const router = require('express').Router()

const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()
const UsersService = require('../../backend/services/UsersService')
const usersService = new UsersService()
const PatientService = require('../../backend/services/PatientService')
const patientService = new PatientService()

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

router.get('/register/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('register-add', { title: 'Tambah Registrasi', user: req.session.user })
})


router.get('/register/search', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('register-search', { title: 'Pencarian Registrasi', user: req.session.user })
})

router.get('/register/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    try {
        const data = await registerService.getRegisterById(req.params.id)
        res.render('register-edit', { title: 'Edit Data Registrasi', ...data, user: req.session.user })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
    }
})

router.get('/patient/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('patient-add', { title: 'Tambah Pasien', user: req.session.user })
})

router.get('/patient', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('patient-data', { title: 'Data Pasien', user: req.session.user })
})

router.get('/patient/edit/:id', async (req, res) => {
    
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    try {
        const data = await patientService.getPatientById(req.params.id)
        res.render('patient-edit', { title: 'Edit Data pasien', ...data, user: req.session.user })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
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
        res.render('finance-annually', { title: 'Keuangan', ...data, user: req.session.user })
    } catch (error) {
        res.status(404).render('500', { title: 'Error' })
    }
})

router.get('/finance/monthly', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    res.render('finance-monthly', { title: 'Rekap Pasien', user: req.session.user })
})

router.get('/finance/daily', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (!['admin', 'pendaftaran'].includes(req.session.user.role)) {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    const defaultDate = getCurrentDateInWIB()
    res.render('finance-daily', { title: 'Rekap Pasien', defaultDate, user: req.session.user })
})

router.get('/holiday', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('holiday', { title: 'Hari Libur', user: req.session.user})
})

router.get('/users', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    res.render('users-data', { title: 'Users', user: req.session.user })
})

router.get('/users/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    res.render('users-add', { title: 'Tambah User', user: req.session.user })
})

router.get('/users/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    if (req.session.user.role !== 'admin') {
        return res.status(404).render('404', { title: 'Forbidden' })
    }

    try {
        const data = await usersService.getUserById(req.params.id)
        res.render('users-edit', { title: 'Edit User', users: data, user: req.session.user })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
    }
})

router.get('/users/password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/admin/login')
    }

    res.render('change-password', { title: 'Ganti Password', user: req.session.user })
})

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin')
    }

    res.render('login', { title: 'Login' })
})

module.exports = router