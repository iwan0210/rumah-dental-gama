const pool = require('../../db')
const { nanoid } = require('nanoid')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class RegisterClass {
    constructor() {
        this._pool = pool
    }

    async register(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan) {

        await this.checkDuplicate(nik, tanggalDaftar)

        const id = nanoid(16)
        const queueNumber = await this.getQueueNumber(tanggalDaftar)
        await this._pool.query("INSERT INTO registrasi (id, no_reg, nama, nik, jk, tgl_lahir, nohp, alamat, tanggal, keluhan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, queueNumber, nama, nik, jk, tglLahir, nohp, alamat, tanggalDaftar, keluhan])

        return [id, queueNumber]
    }

    async insertCompleteRegister(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total) {
        const id = nanoid(16)
        const queueNumber = await this.getQueueNumber(tanggalDaftar)
        await this._pool.query("INSERT INTO registrasi (id, no_reg, nama, nik, jk, tgl_lahir, nohp, alamat, tanggal, keluhan, diagnosa, tindakan, obat, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, queueNumber, nama, nik, jk, tglLahir, nohp, alamat, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total])
        return id
    }

    async getAllRegister(page, limit, startDate, endDate) {
        const offset = (page - 1) * limit
        const [result] = await this._pool.query("SELECT * FROM registrasi WHERE tanggal BETWEEN ? AND ? ORDER BY tanggal DESC, no_reg DESC LIMIT ? OFFSET ?", [startDate, endDate, parseInt(limit), offset])
        const [count] = await this._pool.query("SELECT COUNT(*) as total FROM registrasi WHERE tanggal BETWEEN ? AND ?", [startDate, endDate])
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
        const [result] = await this._pool.query("SELECT COALESCE(SUM(total), 0) as total FROM registrasi")
        const total = result[0].total

        const [today] = await this._pool.query("SELECT COALESCE(SUM(total), 0) as total FROM registrasi WHERE DATE(tanggal) = CURDATE()")
        const todayCount = today[0].total

        const [thisWeek] = await this._pool.query("SELECT COALESCE(SUM(total), 0) as total FROM registrasi WHERE WEEK(tanggal) = WEEK(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
        const thisWeekCount = thisWeek[0].total

        const [thisMonth] = await this._pool.query("SELECT COALESCE(SUM(total), 0) as total FROM registrasi WHERE MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())")
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

    async getFinanceByYear(year) {
        const [result] = await this._pool.query(`
            SELECT 
                YEAR(tanggal) AS tahun,
                MONTH(tanggal) AS bulan,
                COUNT(*) AS jumlah_pasien,
                SUM(COALESCE(total, 0)) AS total
            FROM registrasi
            WHERE YEAR(tanggal) = ?
            GROUP BY tahun, MONTH(tanggal)
            ORDER BY MONTH(tanggal)
      `, [year])

        if (result.length < 1) {
            throw new NotFoundError(`Data keuangan tahun ${year} tidak ditemukan`)
        }

        return result
    }

    async getQueueNumber(registerDate) {
        const [result] = await this._pool.query("SELECT MAX(no_reg) as total FROM registrasi WHERE tanggal = ?", [registerDate])
        const total = result[0].total || 0

        return total + 1
    }

    async getAllRegisterByYearMonth(year, month) {
        const [result] = await this._pool.query(`SELECT 
            id, nama, nik, jk, tgl_lahir, nohp, alamat, no_reg, tanggal,
            keluhan, diagnosa, tindakan, obat,
            IFNULL(total, 0) AS total
        FROM registrasi 
        WHERE YEAR(tanggal) = ? AND MONTH(tanggal) = ?
        ORDER BY tanggal ASC, no_reg ASC`, [year, month])

        if (result.length < 1) {
            throw new NotFoundError(`Data registrasi tahun ${year} bulan ${month} tidak ditemukan`)
        }

        const rows = result.map(row => ({
            ...row,
            total: Number(row.total)
        }))

        return rows
    }

    async getPatientByNameOrNik(nameOrNik) {
        const [result] = await this._pool.query("SELECT * FROM registrasi WHERE nama LIKE ? OR nik LIKE ? order by tanggal desc, no_reg asc", [`%${nameOrNik}%`, `%${nameOrNik}%`])

        const cleaned = result.map(row => ({
            ...row,
            diagnosa: row.diagnosa || '',
            tindakan: row.tindakan || '',
            obat: row.obat || '',
            total: row.total ?? 0,
        }))

        return cleaned
    }

    async checkDuplicate(nik, tanggal) {
        const [result] = await this._pool.query("SELECT id FROM registrasi WHERE nik = ? and tanggal = ?", [nik, tanggal])

        if (result.length > 0) {
            throw new InvariantError("Pasien sudah terdaftar pada tanggal tersebut")
        }
    }

    async getAllRegisterByRangeDate(startDate, endDate) {
        const [result] = await this._pool.query(`SELECT 
            id, nama, nik, jk, tgl_lahir, nohp, alamat, no_reg, tanggal,
            keluhan, diagnosa, tindakan, obat,
            IFNULL(total, 0) AS total
        FROM registrasi 
        WHERE tanggal BETWEEN ? AND ?
        ORDER BY tanggal ASC, no_reg ASC`, [startDate, endDate])

        if (result.length < 1) {
            throw new NotFoundError(`Data registrasi tidak ditemukan`)
        }

        const rows = result.map(row => ({
            ...row,
            total: Number(row.total)
        }))

        return rows
    }
}

module.exports = RegisterClass