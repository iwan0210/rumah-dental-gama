require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', [
    path.join(__dirname, 'frontend/visitor/views'),
    path.join(__dirname, 'frontend/admin/views')
])

const errorHandler = require('./backend/middleware/ErrorHandler')
const registerRoutes = require('./backend/api/register/routes')
const usersRoutes = require('./backend/api/users/routes')
const visitorRoutes = require('./frontend/visitor')
const adminRoutes = require('./frontend/admin')

app.use('/api/register', registerRoutes, errorHandler)
app.use('/api/users', usersRoutes, errorHandler)
app.use('/', visitorRoutes)
app.use('/admin', adminRoutes)

app.get('/{*splat}',(_, res) => {
    res.status(404).render('404', { title: 'Error' })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})