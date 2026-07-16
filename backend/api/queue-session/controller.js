class QueueSessionHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.getAllQueueSessions = this.getAllQueueSessions.bind(this)
        this.getAllActiveQueueSessions = this.getAllActiveQueueSessions.bind(this)
        this.getQueueSessionById = this.getQueueSessionById.bind(this)
        this.inserQueueSession = this.inserQueueSession.bind(this)
        this.updateQueueSession = this.updateQueueSession.bind(this)
        this.UpdateStatusQueueSession = this.UpdateStatusQueueSession.bind(this)
    }

    async getAllQueueSessions(req, res, next) {
        try {
            const result = await this._service.getAllQueueSessions()

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

    async getAllActiveQueueSessions(req, res, next) {
        try {
            const result = await this._service.getAllActiveQueueSessions()

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

    async getQueueSessionById(req, res, next) {
        try {
            const { id } = req.params

            const result = this._service.getQueueSessionsById(id)

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

    async inserQueueSession(req, res, next) {
        try {
            this._validator.validateInsertQueueSessionPayload(req.body)

            const { name, startTime, endTime } = req.body

            const id = await this._service.inserQueueSession(name, startTime, endTime)

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

    async updateQueueSession(req, res, next) {
        try {
            this._validator.validateUpdateQueueSessionPayload(req.body)

            const { id } = req.params

            const { name, startTime, endTime } = req.body
            
            await this._service.updateQueueSession(id, name, startTime, endTime)

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

    async UpdateStatusQueueSession(req, res, next) {
        try {
            this._validator.validateUpdateStatusQueueSessionPayload(req.body)

            const { id } = req.params

            const { status } = req.body

            await this._service.UpdateStatusQueueSession(id, status)

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

module.exports = QueueSessionHandler