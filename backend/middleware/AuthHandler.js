const jwt = require('jsonwebtoken')
const AuthenticationError = require('../exceptions/AuthenticationError')

const verifyToken = (req, _, next) => {
    try {
        const { authorization } = req.headers

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AuthenticationError('Authorization header is missing')
        }

        const token = authorization.split(' ')[1]

        if (!token) {
            throw new AuthenticationError('Token is missing')
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decoded) {
            throw new AuthenticationError('Invalid token')
        }

        req.id = decoded.id
        req.user = decoded.user
        req.name = decoded.name

        next()
    } catch (error) {
        next(error)
    }
}

const verifyAdminToken = (req, _, next) => {
    try {
        const { authorization } = req.headers

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AuthenticationError('Authorization header is missing')
        }

        const token = authorization.split(' ')[1]

        if (!token) {
            throw new AuthenticationError('Token is missing')
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decoded) {
            throw new AuthenticationError('Invalid token')
        }

        if (decoded.role !== 'admin') {
            throw new AuthenticationError('Access denied, admin role required')
        }

        req.id = decoded.id
        req.user = decoded.user
        req.name = decoded.name
        req.role = decoded.role

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = { verifyToken, verifyAdminToken }