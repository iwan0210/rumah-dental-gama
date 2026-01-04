const pool = require('../../db')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class HolidayClass {
    constructor() {
        this._pool = pool
    }

    async getAllHolidays(page, limit) {
        const offset = (page - 1) * limit
        const [result] = await this._pool.query("SELECT * FROM holiday ORDER BY tanggal DESC LIMIT ? OFFSET ?", [parseInt(limit), offset])
        const [count] = await this._pool.query("SELECT COUNT(*) FROM holiday")
        const total = count[0].total
        const totalPage = Math.ceil(total / limit) || 1
        const nextPage = page < totalPage ? page + 1 : null
        const prevPage = page > 1 ? page - 1 : null
         return {
            result,
            total,
            totalPage,
            nextPage,
            prevPage
        }
    }

    async getHolidayByDate(date) {
        const [result] = await this._pool.query("SELECT * FROM holiday WHERE tanggal = ?", [date])

        if (result.length < 1) {
            throw new NotFoundError(`Hari libur tanggal ${date} tidak ditemukan`)
        }

        return result[0]
    }

    async insertHoliday(date, reason) {
        await this.checkDuplicate(date)

        await this._pool.query("INSERT INTO holiday VALUES (?, ?)", [date, reason])

        return date
    }

    async updateHoliday(date, reason) {
        const [result] = await this._pool.query("UPDATE holiday SET keterangan = ? WHERE tanggal = ?", [reason, date])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Hari Libur tanggal ${date} tidak ditemukan`)
        }
    }

    async deleteHoliday(date) {
        const [result] = await this._pool.query("DELETE FROM holiday WHERE tanggal = ?", [date])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Hari Libur tanggal ${date} tidak ditemukan`)
        }
    }

    async checkDuplicate(date) {
        const [result] = await this._pool.query("SELECT tanggal FROM holiday WHERE tanggal = ?", [date])
        if (result.length > 0) {
            throw new InvariantError("Hari Libur tanggal tersebut sudah ada")
        }
    }
}

module.exports = HolidayClass