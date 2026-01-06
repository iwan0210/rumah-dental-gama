class HolidayHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.getAllHolidays = this.getAllHolidays.bind(this)
        this.getHolidayByDate = this.getHolidayByDate.bind(this)
        this.postHoliday = this.postHoliday.bind(this)
        this.putHoliday = this.putHoliday.bind(this)
        this.deleteHoliday = this.deleteHoliday.bind(this)
    }

    async getAllHolidays(req, res, next) {
        try {
            this._validator.validateGetAllHolidayPayload(req.query)
            const { page = 1, limit = 10, search = '' } = req.query

            const { result, total, totalPage, nextPage, prevPage } = await this._service.getAllHolidays(page, limit, search)
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

    async getHolidayByDate(req, res, next) {
        try {
            this._validator.validateParamsHolidayPayload(req.params)
            const { date } = req.params
            const result = await this._service.getHolidayByDate(date)
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

    async postHoliday(req, res, next) {
        try {
            this._validator.validateAddHolidayPayload(req.body)

            const { tanggal: date, keterangan } = req.body

            const tanggal = await this._service.insertHoliday(date, keterangan)

            const response = {
                error: false,
                status: 201,
                message: 'Success',
                data: {
                    tanggal
                }
            }
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async putHoliday(req, res, next) {
        try {
            this._validator.validateEditHolidayPayload(req.body)
            const { date } = req.params
            const { keterangan } = req.body

            await this._service.updateHoliday(date, keterangan)

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

    async deleteHoliday(req, res, next) {
        try {
            const { date } = req.params
            await this._service.deleteHoliday(date)
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

module.exports = HolidayHandler