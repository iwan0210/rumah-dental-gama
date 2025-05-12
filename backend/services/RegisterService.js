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
            [id, nama, nik, jk, tglLahir, alamat, nohp, tanggalDaftar, keluhan])

        return id
    }

    async insertCompleteRegister(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total) {
        const id = nanoid(32)
        await this._pool.query("INSERT INTO registrasi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, nama, nik, jk, tglLahir, alamat, nohp, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total])
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
}

module.exports = RegisterClass