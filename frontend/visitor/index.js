const router = require('express').Router()
const moment = require('moment')


const RegisterService = require('../../backend/services/RegisterService')
const registerService = new RegisterService()

router.get('/', (_, res) => {
    res.render('index', { title: 'Home' })
})

router.get('/register', (_, res) => {
    res.render('register', { title: 'Home' })
})

router.get('/register/:id', async (req, res) => {
    try {
        const data = await registerService.getRegisterById(req.params.id)
        res.render('hasil-register', { title: 'Hasil', ...data, moment })
    } catch (error) {
        res.status(404).render('404', { title: 'Error' })
    }
})

module.exports = router