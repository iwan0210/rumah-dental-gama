const pool = require('../../db')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class ScheduleService {
    constructor() {
        this._pool = pool
    }

    async getAllSchedule() {
        const [result] = await this._pool.query("SELECT * FROM schedule ORDER BY day_name ASC, start_time ASC")

        return result
    }

    async getActiveScheduleByDayName(date) {
        const [result] = await this._pool.query("SELECT * FROM schedule WHERE day_name = ? and status = 1 ORDER BY start_time ASC",
            [this.convertDateToDayName(date)]
        )

        return result;
    }

    async getScheduleById(id) {
        const [result] = await this._pool.query("SELECT * FROM schedule WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async getActiveScheduleById(id) {
        const [result] = await this._pool.query("SELECT * FROM schedule WHERE id = ? AND status = 1", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async insertSchedule(dayName, startTime, endTime) {
        const [result] = await this._pool.query("INSERT INTO schedule(day_name, start_time, end_time) VALUES(?, ?, ?)", [dayName, startTime, endTime])

        return result.insertId
    }

    async updateSchedule(id, dayName, startTime, endTime) {
        const [result] = await this._pool.query("UPDATE schedule SET day_name = ?, start_time = ?, end_time = ? WHERE id = ?", [dayName, startTime, endTime, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }
    }

    async UpdateScheduleStatus(id, status) {
        const [result] = await this._pool.query("UPDATE schedule SET status = ? WHERE id = ?", [status, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Jadwal dengan id ${id} tidak ditemukan`)
        }
    }

    convertDateToDayName(date) {
        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) {
            throw new InvariantError('Invalid date');
        }

        const days = [
            'MINGGU',
            'SENIN',
            'SELASA',
            'RABU',
            'KAMIS',
            'JUMAT',
            'SABTU',
        ]

        return days[parsedDate.getDay()]
    }
}

module.exports = ScheduleService