const router = require('express').Router()

router.get('/', (_, res) => {
    res.render('home', { title: 'Home' })
})

router.get('/login', (_, res) => {
    res.render('login', { title: 'Login' })
})

module.exports = router