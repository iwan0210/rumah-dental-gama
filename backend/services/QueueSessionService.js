const pool = require('../../db')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class QueueSessionService {
    constructor() {
        this._pool = pool
    }

    async getAllQueueSessions() {
        const [result] = await this._pool.query("SELECT * FROM queue_session ORDER BY status DESC, start_time ASC")
         return result
    }

    async getAllActiveQueueSessions() {
        const [result] = await this._pool.query("SELECT * FROM queue_session WHERE status = 1 ORDER BY start_time ASC")

        return result
    }

    async getQueueSessionsById(id) {
        const [result] = await this._pool.query("SELECT * FROM queue_session WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async getActiveQueueSessionById(id) {
        const [result] = await this._pool.query("SELECT * FROM queue_session WHERE id = ? and status = 1", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async inserQueueSession(name, startTime, endTime) {
        const [result] = await this._pool.query("INSERT INTO queue_session(name, start_time, end_time) VALUES (?, ?, ?)", [name, startTime, endTime])

        return result.insertId
    }

    async updateQueueSession(id, name, startTime, endTime) {
        const [result] = await this._pool.query("UPDATE queue_session SET name = ?, start_time = ?, end_time = ? WHERE id = ?", [name, startTime, endTime, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }
    }

    async UpdateStatusQueueSession(id, status) {
        const [result] = await this._pool.query("UPDATE queue_session SET status = ? WHERE id = ?", [status, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }
    }
}

module.exports = QueueSessionService