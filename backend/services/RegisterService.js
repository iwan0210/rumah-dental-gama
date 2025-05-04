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

    async getRegisterById(id) {

        const [result] = await this._pool.query("SELECT id, nama, nik, jk, tgl_lahir, alamat, nohp, tanggal, keluhan FROM registrasi WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`Register dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

}

module.exports = RegisterClass