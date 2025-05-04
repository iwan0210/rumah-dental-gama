class RegisterHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.postRegisterHandler = this.postRegisterHandler.bind(this)
        this.getRegisterByIdHandler = this.getRegisterByIdHandler.bind(this)
    }

    async postRegisterHandler(req, res, next) {
        try {
            const { nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan } = req.body
            this._validator.validateAddRegisterPayload(req.body)
            const id = await this._service.register(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan)
            const response = {
                error: false,
                status: 201,
                message: 'Success',
                data: {
                    id
                }
            }
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getRegisterByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            const result = await this._service.getRegisterById(id)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: {
                    result
                }
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = RegisterHandler