require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const port = process.env.PORT || 3000

const dbOptions = {
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASS,
    database: process.env.MYSQLDB,
}

const sessionStore = new MySQLStore(dbOptions);

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-default-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}))

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

app.get('/{*splat}', (_, res) => {
    res.status(404).render('404', { title: 'Error' })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})