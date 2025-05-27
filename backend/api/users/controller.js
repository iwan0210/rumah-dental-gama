class UsersHandler {
    constructor(service, validator, tokenManager) {
        this._service = service
        this._validator = validator
        this._tokenManager = tokenManager

        this.postUserLoginHandler = this.postUserLoginHandler.bind(this)
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this)
        this.putUserChangePasswordHandler = this.putUserChangePasswordHandler.bind(this)
        this.postUserLogoutHandler = this.postUserLogoutHandler.bind(this)
        this.getAllUsersHandler = this.getAllUsersHandler.bind(this)
        this.deleteUserByIdHandler = this.deleteUserByIdHandler.bind(this)
        this.postUserRegisterHandler = this.postUserRegisterHandler.bind(this)
        this.putUserUpdateHandler = this.putUserUpdateHandler.bind(this)
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

            req.session.save()

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

    async postUserLogoutHandler(req, res, next) {
        try {
            req.session.destroy(err => {
                if (err) {
                    throw new Error('Failed to logout')
                }
                res.clearCookie('connect.sid')
                res.status(200).json({
                    error: false,
                    status: 200,
                    message: 'Logout successful'
                })
            })
        } catch (error) {
            next(error)
        }
    }

    async getAllUsersHandler(req, res, next) {
        try {
            const { search = '' } = req.query
            const users = await this._service.getAllUsers(search)

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: users
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async deleteUserByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            await this._service.deleteUserById(id)

            const response = {
                error: false,
                status: 200,
                message: 'User deleted successfully'
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async postUserRegisterHandler(req, res, next) {
        try {
            this._validator.validateAddUserPayload(req.body)
            const newUser = req.body

            const userId = await this._service.insertUser(newUser)

            const response = {
                error: false,
                status: 201,
                message: 'User registered successfully',
                data: { id: userId }
            }

            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async putUserUpdateHandler(req, res, next) {
        try {
            this._validator.validateUpdateUserPayload(req.body)
            const { id } = req.params
            const userData = req.body

            await this._service.updateUserById(id, userData)

            const response = {
                error: false,
                status: 200,
                message: 'User updated successfully'
            }

            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UsersHandler