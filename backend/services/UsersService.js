const pool = require('../../db')
const bcrypt = require('bcryptjs')
const AuthenticationError = require('../exceptions/AuthenticationError')
const InvariantError = require('../exceptions/InvariantError')
const NotFoundError = require('../exceptions/NotFoundError')

class UsersService {
    constructor() {
        this._pool = pool
    }

    async verifyUser(username, password) {
        const [result] = await this._pool.query("SELECT * FROM users WHERE user = ?", [username])

        if (result.length < 1) {
            throw new AuthenticationError("Kredensial  yang anda berikan salah")
        }

        const { id, user, name, role, password: hashedPassword } = result[0]

        const match = await bcrypt.compare(password, hashedPassword)
        if (!match) {
            throw new AuthenticationError("Kredensial  yang anda berikan salah")
        }

        return { id, user, name, role }
    }

    async changePassword(id, oldPassword, newPassword) {
        const [data] = await this._pool.query("SELECT * FROM users WHERE id = ?", [id])

        if (data.length < 1) {
            throw new NotFoundError(`User dengan id ${id} tidak ditemukan`)
        }
        const { password: hashedOldPassword } = data[0]
        const match = await bcrypt.compare(oldPassword, hashedOldPassword)
        if (!match) {
            throw new AuthenticationError("Password lama yang anda berikan salah")
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)


        const [result] = await this._pool.query("UPDATE users SET password = ? WHERE id = ? AND password = ?", [hashedPassword, id, hashedOldPassword])
        
        if (result.affectedRows === 0) {
            throw new InvariantError("Gagal mengubah password")
        }
    }

    async getUserById(id) {
        const [result] = await this._pool.query("SELECT id, user, name, role FROM users WHERE id = ?", [id])

        if (result.length < 1) {
            throw new NotFoundError(`User dengan id ${id} tidak ditemukan`)
        }

        return result[0]
    }

    async getAllUsers(search) {
        const [result] = await this._pool.query("SELECT id, user, name, role FROM users WHERE user LIKE ? OR name LIKE ? ORDER BY id DESC", [`%${search}%`, `%${search}%`])

        return result
    }

    async deleteUserById(id) {
        const [result] = await this._pool.query("DELETE FROM users WHERE id = ?", [id])

        if (result.affectedRows === 0) {
            throw new NotFoundError(`User dengan id ${id} tidak ditemukan`)
        }
    }

    async insertUser(newUser) {
        const { user, name, password, role = "pendaftaran" } = newUser

        const hashedPassword = await bcrypt.hash(password, 10)

        const query = 'INSERT INTO users (user, name, password, role) VALUES (?, ?, ?, ?)'

        const [result] = await this._pool.query(query, [user, name, hashedPassword, role])

        return result.insertId
    }

    async updateUserById(id, userData) {
        const { user, name, password, role } = userData
        let hashedPassword = null

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10)
        }

        const query = 'UPDATE users SET user = ?, name = ?, role = ?' + (hashedPassword ? ', password = ?' : '') + ' WHERE id = ?'
        const params = [user, name, role]
        if (hashedPassword) {
            params.push(hashedPassword)
        }
        params.push(id)

        const [result] = await this._pool.query(query, params)

        if (result.affectedRows === 0) {
            throw new NotFoundError(`User dengan id ${id} tidak ditemukan`)
        }
    }
}

module.exports = UsersService