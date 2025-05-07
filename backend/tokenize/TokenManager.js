const jwt = require('jsonwebtoken')

const TokenManager = {
    generateAccessToken: payload => {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
    }
}

module.exports = TokenManager