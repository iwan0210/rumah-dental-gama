const ClientError = require('../exceptions/ClientError')
const AuthenticationError = require('../exceptions/AuthenticationError');

const ErrorHandler = (err, req, res, _next) => {
    if (err instanceof AuthenticationError) {
        if (req.session) {
            req.session.destroy(() => {})
        }

        res.clearCookie('sid')
    }

    const errStatus = err.statusCode || 500
    const errMsg = err instanceof ClientError
        ? err.message
        : 'Something went wrong'

    if (!(err instanceof ClientError)) {
        console.error(err)
    }

    res.status(errStatus).json({
        error: true,
        status: errStatus,
        message: errMsg
    })
}

module.exports = ErrorHandler