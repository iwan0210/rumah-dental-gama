const pool = require('../../db')
const { nanoid } = require('nanoid')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class PatientService {
    constructor() {
        this._pool = pool
    }

    async getPatientById(id) {
        const [result] = await this._pool.query("SELECT * FROM pasien WHERE no_rkm_medis = ?", [id])
        if (result.length < 1) {
            throw new NotFoundError(`Pasien dengan Nomor Rekam Medis ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async getPatientByIdAndBirth(id, birth) {
        const [result] = await this._pool.query("SELECT * FROM pasien WHERE tgl_lahir = ? AND (no_rkm_medis = ? OR nik = ?)", [birth, id, id])
        if (result.length < 1) {
            throw new NotFoundError(`Pasien tidak ditemukan`)
        }

        return result[0]
    }

    async searchPatient(keyword, page, limit) {
        const keywordFormat = `%${keyword}%`
        const offset = (page - 1) * limit
        const [result] = await this._pool.query("SELECT * FROM pasien WHERE (no_rkm_medis LIKE ? OR nama LIKE ? OR nik LIKE ? OR alamat LIKE ?) ORDER BY CAST(SUBSTRING(no_rkm_medis,3,2) AS UNSIGNED) DESC, CAST(SUBSTRING(no_rkm_medis,5,2) AS UNSIGNED) DESC, CAST(SUBSTRING(no_rkm_medis,1,2) AS UNSIGNED) DESC LIMIT ? OFFSET ?", [keywordFormat, keywordFormat, keywordFormat, keywordFormat, parseInt(limit), offset])
        const [count] = await this._pool.query("SELECT COUNT(no_rkm_medis) AS total FROM pasien WHERE (no_rkm_medis LIKE ? OR nama LIKE ? OR nik LIKE ? OR alamat LIKE ?)", [keywordFormat, keywordFormat, keywordFormat, keywordFormat])

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

    async searchPatientLimited(keyword) {
        const terms = keyword.trim().toLowerCase().split(/\s+/).filter(t => t.length >= 2)

        let conditions = []
        let params = []

        for (const term of terms) {
            if (/^\d+$/.test(term)) {
                conditions.push(`(
                    nik = ?
                    OR no_rkm_medis = ?
                    OR nik LIKE ?
                    OR no_rkm_medis LIKE ?
                )`)
                params.push(term, term, `${term}%`, `${term}%`)
            } else {
                conditions.push(`(
                    nama LIKE ? COLLATE utf8mb4_general_ci
                    OR alamat LIKE ? COLLATE utf8mb4_general_ci
                )`)
                params.push(`%${term}%`, `%${term}%`)
            }
        }

        const sql = `
            SELECT no_rkm_medis, nama, nik, jk, tgl_lahir, nohp, alamat
            FROM pasien
            ${conditions.length ? 'WHERE ' + conditions.join(' OR ') : ''}
            LIMIT 15
        `

        const [result] = await this._pool.query(sql, params)

        return result
    }

    async addPatient(nama, nik, jk, tglLahir, nohp, alamat) {
        const valid = this.nikVerifByBirthDate(nik, tglLahir, jk)
        if (!valid) {
            throw new InvariantError("NIK tidak valid")
        }

        await this.checkDuplicate(nik)

        const newRM = this.generateNewRM(await this.getLastRM())

        await this._pool.query("INSERT INTO pasien VALUES (?, ?, ?, ?, ?, ?, ?)", [newRM, nama, nik, jk, tglLahir, nohp, alamat])

        return newRM
    }

    async updatePatient(id, nama, nik, jk, tglLahir, nohp, alamat) {
        const valid = this.nikVerifByBirthDate(nik, tglLahir, jk)
        if (!valid) {
            throw new InvariantError("NIK tidak valid")
        }

        await this.updateCheckDuplicate(nik, id)

        const [result] = await this._pool.query("UPDATE pasien SET nama = ?, nik = ?, jk = ?, tgl_lahir = ?, nohp = ?, alamat = ? WHERE no_rkm_medis = ?", [nama, nik, jk, tglLahir, nohp, alamat, id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Pasien tidak ditemukan`)
        }
    }

    async checkDuplicate(nik) {
        const [result] = await this._pool.query("SELECT nik FROM pasien WHERE nik = ?", [nik])

        if (result.length > 0) {
            throw new InvariantError("NIK sudah pernah terdaftar")
        }
    }

    async updateCheckDuplicate(nik, id) {
        const [result] = await this._pool.query(
            "SELECT no_rkm_medis FROM pasien WHERE nik = ? AND no_rkm_medis != ?",
            [nik, id]
        )

        if (result.length > 0) {
            throw new InvariantError("NIK sudah terdaftar")
        }
    }

    async getLastRM() {
        const [result] = await this._pool.query("SELECT no_rkm_medis FROM pasien ORDER BY CAST(SUBSTRING(no_rkm_medis,3,2) AS UNSIGNED) DESC, CAST(SUBSTRING(no_rkm_medis,5,2) AS UNSIGNED) DESC, CAST(SUBSTRING(no_rkm_medis,1,2) AS UNSIGNED) DESC LIMIT 1")

        return result[0].no_rkm_medis
    }

    generateNewRM(lastRM) {
        if (!lastRM || lastRM === '000000') {
            return '010000'
        }

        let AA = parseInt(lastRM.substring(0, 2), 10)
        let BB = parseInt(lastRM.substring(2, 4), 10)
        let CC = parseInt(lastRM.substring(4, 6), 10)

        AA++

        if (AA > 99) {
            AA = 1

            if (CC === 0) {
                BB++
            } else {
                BB++
                CC++
            }

            if (BB > 99) BB = 0
            if (CC > 99) CC = 0
        }

        return (
            String(AA).padStart(2, '0') +
            String(BB).padStart(2, '0') +
            String(CC).padStart(2, '0')
        )
    }

    nikVerifByBirthDate(nik, tglLahir, jk) {
        // ambil bagian dari NIK
        const dd = parseInt(nik.substring(6, 8), 10);
        const mm = parseInt(nik.substring(8, 10), 10);
        const yy = parseInt(nik.substring(10, 12), 10);

        // parse tanggal lahir (yyyy-mm-dd)
        const date = new Date(tglLahir);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear() % 100;

        // khusus perempuan → tanggal +40
        const expectedDay = (jk === 'P' || jk === 'p') ? day + 40 : day;

        // validasi
        return dd === expectedDay && mm === month && yy === year;
    }
}

module.exports = PatientService