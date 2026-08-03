class ScheduleHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.getAllSchedule = this.getAllSchedule.bind(this)
        this.getActiveScheduleByDayName = this.getActiveScheduleByDayName.bind(this)
        this.getActiveScheduleById = this.getActiveScheduleById.bind(this)
        this.insertSchedule = this.insertSchedule.bind(this)
        this.updateSchedule = this.updateSchedule.bind(this)
        this.UpdateScheduleStatus = this.UpdateScheduleStatus.bind(this)
    }

    async getAllSchedule(req, res, next) {
        try {
            const result = await this._service.getAllSchedule()

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

    async getActiveScheduleByDayName(req, res, next) {
        try {
            const { date } = req.params

            const result = await this._service.getActiveScheduleByDayName(date)

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

    async getActiveScheduleById(req, res, next) {
        try {
            const { id } = req.params
            
            const result = await this._service.getActiveScheduleById(id)

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

    async insertSchedule(req, res, next) {
        try {
            this._validator.validateInsertSchedulePayload(req.body)

            const { dayName, startTime, endTime } = req.body

            const id = await this._service.insertSchedule(dayName, startTime, endTime)

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

    async updateSchedule(req, res, next) {
        try {
            this._validator.validateUpdateSchedulePayload(req.body)

            const { id } = req.params

            const { dayName, startTime, endTime } = req.body

            await this._service.updateSchedule(id, dayName, startTime, endTime)

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

    async UpdateScheduleStatus(req, res, next) {
        try {
            this._validator.validateUpdateScheduleStatusPayload(req.body)

            const { id } = req.params

            const { status } = req.body

            await this._service.UpdateScheduleStatus(id, status)

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

module.exports = ScheduleHandler