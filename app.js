require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const helmet = require('helmet')
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

            // ✅ JS (kalau pakai CDN atau inline)
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net"
            ],

            scriptSrcAttr: [
                "'unsafe-inline'"
            ],

            // ✅ CSS (bootstrap CDN)
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net"
            ],

            // ✅ gambar
            imgSrc: [
                "'self'",
                "data:",
                "https://maps.gstatic.com",
                "https://maps.googleapis.com"
            ],

            // ✅ API / fetch / axios
            connectSrc: [
                "'self'",
                "https://cdn.jsdelivr.net"
            ],

            // ✅ iframe (Google Maps)
            frameSrc: [
                "'self'",
                "https://www.google.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdn.jsdelivr.net"
            ],
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
const holidayRoutes = require('./backend/api/holiday/routes')
const patientRoutes = require('./backend/api/patient/routes')
const visitorRoutes = require('./frontend/visitor')
const adminRoutes = require('./frontend/admin')

app.use('/api/register', registerRoutes, errorHandler)
app.use('/api/users', usersRoutes, errorHandler)
app.use('/api/holiday', holidayRoutes, errorHandler)
app.use('/api/patient', patientRoutes, errorHandler)
app.use('/', visitorRoutes)
app.use('/admin', adminRoutes)

app.get('/{*splat}', (_, res) => {
    res.status(404).render('404', { title: 'Error' })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})