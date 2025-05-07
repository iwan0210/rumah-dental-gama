const jwt = require('jsonwebtoken')
const AuthenticationError = require('../exceptions/AuthenticationError')
const ClientError = require('../exceptions/ClientError')

const verifyToken = (req, res, next) => {
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
            throw new ClientError('Invalid token')
        }

        req.id = decoded.id
        req.user = decoded.user
        req.name = decoded.name

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = { verifyToken }