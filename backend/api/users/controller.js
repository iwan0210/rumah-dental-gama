const { name } = require("ejs")

class UsersHandler {
    constructor(service, validator, tokenManager) {
        this._service = service
        this._validator = validator
        this._tokenManager = tokenManager

        this.postUserLoginHandler = this.postUserLoginHandler.bind(this)
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this)
        this.putUserChangePasswordHandler = this.putUserChangePasswordHandler.bind(this)
    }

    async postUserLoginHandler(req, res, next) {
        try {
            this._validator.validateLoginPayload(req.body)
            const { user, password } = req.body

            const userCred = await this._service.verifyUser(user, password)

            const accessToken = this._tokenManager.generateAccessToken(userCred)

            req.session.user = {
                id: userCred.id,
                user: userCred.user,
                name: userCred.name,
                role: userCred.role
            }

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: {
                    ...userCred,
                    accessToken
                }
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getUserByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            const user = await this._service.getUserById(id)

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: user
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async putUserChangePasswordHandler(req, res, next) {
        try {
            this._validator.validateChangePasswordPayload(req.body)
            const id = req.id
            const { oldPassword, newPassword } = req.body

            await this._service.changePassword(id, oldPassword, newPassword)

            const response = {
                error: false,
                status: 200,
                message: 'Success'
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UsersHandler