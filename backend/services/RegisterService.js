const pool = require('../../db')
const { nanoid } = require('nanoid')
const NotFoundError = require('../exceptions/NotFoundError')

class RegisterClass {
    constructor() {
        this._pool = pool
    }

    async register(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan) {

        const id = nanoid(32)
        await this._pool.query("INSERT INTO registrasi (id, nama, nik, jk, tgl_lahir, alamat, nohp, tanggal, keluhan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, nama, nik, jk, tglLahir, nohp, alamat, tanggalDaftar, keluhan])

        return id
    }

    async insertCompleteRegister(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total) {
        const id = nanoid(32)
        await this._pool.query("INSERT INTO registrasi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, nama, nik, jk, tglLahir, nohp, alamat, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total])
        return id
    }

    async getAllRegister(page, limit, startDate, endDate) {
        const offset = (page - 1) * limit
        const [result] = await this._pool.query("SELECT * FROM registrasi WHERE tanggal BETWEEN ? AND ? ORDER BY tanggal DESC LIMIT ? OFFSET ?", [startDate, endDate, parseInt(limit), offset])
        const [count] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi WHERE tanggal BETWEEN ? AND ?", [startDate, endDate])
        const total = count[0].total
        const totalPage = Math.ceil(count / limit) || 1
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

    async getRegisterById(id) {

        const [result] = await this._pool.query("SELECT * FROM registrasi WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Register dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async deleteRegisterById(id) {
        const [result] = await this._pool.query("DELETE FROM registrasi WHERE id = ?", [id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Register dengan id ${id} tidak ditemukan`)
        }
    }

    async updateRegisterById(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total) {
        const [result] = await this._pool.query("UPDATE registrasi SET nama = ?, nik = ?, jk = ?, tgl_lahir = ?, alamat = ?, nohp = ?, tanggal = ?, keluhan = ?, diagnosa = ?, tindakan = ?, obat = ?, total = ? WHERE id = ?",
            [nama, nik, jk, tglLahir, alamat, nohp, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Register dengan id ${id} tidak ditemukan`)
        }
    }

    async getStatistics() {
        const [result] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi")
        const total = result[0].total

        const [today] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi WHERE DATE(tanggal) = CURDATE()")
        const todayCount = today[0].total

        const [thisWeek] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi WHERE WEEK(tanggal) = WEEK(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
        const thisWeekCount = thisWeek[0].total

        const [thisMonth] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi WHERE MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
        const thisMonthCount = thisMonth[0].total

        return {
            total,
            today: todayCount,
            thisWeek: thisWeekCount,
            thisMonth: thisMonthCount
        }
    }

    async getFinance() {
        const [result] = await this._pool.query("SELECT SUM(total) as total FROM registrasi")
        const total = result[0].total

        const [today] = await this._pool.query("SELECT SUM(total) as total FROM registrasi WHERE DATE(tanggal) = CURDATE()")
        const todayCount = today[0].total

        const [thisWeek] = await this._pool.query("SELECT SUM(total) as total FROM registrasi WHERE WEEK(tanggal) = WEEK(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
        const thisWeekCount = thisWeek[0].total

        const [thisMonth] = await this._pool.query("SELECT SUM(total) as total FROM registrasi WHERE MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
        const thisMonthCount = thisMonth[0].total

        return {
            total,
            today: todayCount,
            thisWeek: thisWeekCount,
            thisMonth: thisMonthCount
        }
    }

    async getPatientByNik(nik) {
        const [result] = await this._pool.query("SELECT nama, jk, tgl_lahir, alamat, nohp FROM registrasi WHERE nik = ? order by tanggal desc limit 1", [nik])

        if (result.length < 1) {
            throw new NotFoundError(`Pasien dengan nik ${nik} tidak ditemukan`)
        }

        return result[0]
    }
}

module.exports = RegisterClass