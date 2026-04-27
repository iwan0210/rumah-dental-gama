class PatientHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.getPatientByIdAndBirth = this.getPatientByIdAndBirth.bind(this)
        this.getPatientById = this.getPatientById.bind(this)
        this.postAddPatient = this.postAddPatient.bind(this)
        this.getSearchPatient = this.getSearchPatient.bind(this)
        this.putUpdatePatient = this.putUpdatePatient.bind(this)
        this.getSearchPatientLimited = this.getSearchPatientLimited.bind(this)
    }

    async getPatientByIdAndBirth(req, res, next) {
        try {
            this._validator.validateGetPatientPayload(req.query)

            const { id, tglLahir } = req.query

            const result = await this._service.getPatientByIdAndBirth(id, tglLahir)

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getPatientById(req, res, next) {
        try {
            const { id } = req.params

            const result = await this._service.getPatientById(id)

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async postAddPatient(req, res, next) {
        try {
            this._validator.validateAddPatientPayload(req.body)
            const { nama, nik, nohp, alamat, jk, tglLahir } = req.body

            const no_rkm_medis = await this._service.addPatient(nama, nik, jk, tglLahir, nohp, alamat)

            const response = {
                error: false,
                status: 201,
                message: 'Success',
                data: {
                    no_rkm_medis
                }
            }
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getSearchPatient(req, res, next) {
        try {
            this._validator.validateSearchPatientPayload(req.query)
            const { page = 1, limit = 10, keyword = '' } = req.query
            const { result, total, totalPage, nextPage, prevPage } = await this._service.searchPatient(keyword, page, limit)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result,
                pagination: {
                    total,
                    totalPage,
                    nextPage,
                    prevPage,
                    page: parseInt(page),
                    limit: parseInt(limit),
                }
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getSearchPatientLimited(req, res, next) {
        try {
            const { keyword = '' } = req.query
            const result = await this._service.searchPatientLimited(keyword)

            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result
            }
            res.status(200).json(response)
        } catch (error) {
            
        }
    }

    async putUpdatePatient(req, res, next) {
        try {
            this._validator.validateAddPatientPayload(req.body)
            const { id } = req.params
            const { nama, nik, nohp, alamat, jk, tglLahir } = req.body

            await this._service.updatePatient(id, nama, nik, jk, tglLahir, nohp, alamat)

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

module.exports = PatientHandler