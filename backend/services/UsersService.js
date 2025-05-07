const pool = require('../../db')
const bcrypt = require('bcryptjs')
const AuthenticationError = require('../exceptions/AuthenticationError')

class UsersService {
    constructor() {
        this._pool = pool
    }

    async verifyUser(user, password) {
        const [result] = await this._pool.query("SELECT * FROM users WHERE user = ? AND password = ?", [user, password])

        if (result.length < 1) {
            throw new AuthenticationError("Kredensial  yang anda berikan salah")
        }

        const { id, usern, name, password: hashedPassword } = result[0]

        const match = await bcrypt.compare(password, hashedPassword)
        if (!match) {
            throw new AuthenticationError("Kredensial  yang anda berikan salah")
        }

        return { id, user, name }
    }

    async changePassword(id, oldPassword, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const [result] = await this._pool.query("UPDATE users SET password = ? WHERE id = ? AND password = ?", [hashedPassword, id, oldPassword])
        if (result.affectedRows === 0) {
            throw new InvariantError("Gagal mengubah password")
        }
    }

    async getUserById(id) {
        const [result] = await this._pool.query("SELECT id, user, name FROM users WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`User dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }
}

module.exports = UsersService