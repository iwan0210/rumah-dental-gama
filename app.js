require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const helmet = require('helmet')
const csrf = require('csurf')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const port = process.env.PORT || 3000
const appConfig = require('./config/app')

app.locals.app = appConfig

const dbOptions = {
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASS,
    database: process.env.MYSQLDB,
}

const sessionStore = new MySQLStore({
    ...dbOptions,
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 15,
    expiration: 1000 * 60 * 60 * 24 * 30
})

app.set('trust proxy', 1)

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
            frameSrc: ["'self'", "https://www.google.com"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        }
    }
}))

app.use(session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'your-default-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'frontend/public')))
app.set('view engine', 'ejs')
app.set('views', [
    path.join(__dirname, 'frontend/visitor/views'),
    path.join(__dirname, 'frontend/admin/views')
])

app.use((req, res, next) => {
    try {
        const token = csrf().createToken ? null : null // dummy supaya tidak error
    } catch {}
    next()
})

const csrfProtection = csrf()

app.use((req, res, next) => {
    try {
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null
    } catch {
        res.locals.csrfToken = null
    }
    next()
})

const errorHandler = require('./backend/middleware/ErrorHandler')
const registerRoutes = require('./backend/api/register/routes')
const usersRoutes = require('./backend/api/users/routes')
const holidayRoutes = require('./backend/api/holiday/routes')
const patientRoutes = require('./backend/api/patient/routes')
const scheduleRoutes = require('./backend/api/schedule/routes')
const visitorRoutes = require('./frontend/visitor')
const adminRoutes = require('./frontend/admin')

app.use('/api/register', registerRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/holiday', holidayRoutes)
app.use('/api/patient', patientRoutes)
app.use('/api/schedules', scheduleRoutes)

app.use('/api', errorHandler);

app.use('/', visitorRoutes)
app.use('/admin', adminRoutes)

app.get('/{*splat}', (_, res) => {
    res.status(404).render('404', { title: 'Error' })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})