const router = require('express').Router()

router.get('/', (_, res) => {
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    res.render('home', { title: 'Home', defaultDate })
})

router.get('/add', (_, res) => {
    res.render('add-data', { title: 'Tambah Data' })
})

router.get('/login', (_, res) => {
    res.render('login', { title: 'Login' })
})

module.exports = router