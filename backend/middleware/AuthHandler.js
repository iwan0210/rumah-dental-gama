const jwt = require('jsonwebtoken')
const AuthenticationError = require('../exceptions/AuthenticationError')
const AuthorizationError = require('../exceptions/AuthorizationError')

const verifyToken = (requiredRoles = null) => (req, res, next) => {
    try {
        const auth = req.headers.authorization

        if (!auth?.startsWith("Bearer ")) {
            throw new AuthenticationError("Authorization header is missing");
        }

        const token = auth.substring(7).trim()

        if (!token) {
            throw new AuthenticationError('Token is missing')
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (requiredRoles && !requiredRoles.includes(decoded.role)) {
            throw new AuthorizationError("Access denied");
        }

        req.id = decoded.id
        req.user = decoded.user
        req.name = decoded.name
        req.role = decoded.role

        next()
    } catch (error) {

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            error = new AuthenticationError("Invalid or expired token");
        }

        next(error)
    }
}

module.exports = { verifyToken }