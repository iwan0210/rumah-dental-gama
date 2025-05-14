class RegisterHandler {
    constructor(service, validator, axios) {
        this._service = service
        this._validator = validator
        this._axios = axios

        this.postRegisterHandler = this.postRegisterHandler.bind(this)
        this.getAllRegisterHandler = this.getAllRegisterHandler.bind(this)
        this.getRegisterByIdHandler = this.getRegisterByIdHandler.bind(this)
        this.deleteRegisterByIdHandler = this.deleteRegisterByIdHandler.bind(this)
        this.updateRegisterByIdHandler = this.updateRegisterByIdHandler.bind(this)
        this.postCompleteRegisterHandler = this.postCompleteRegisterHandler.bind(this)
        this.getRegisterByNikHandler = this.getRegisterByNikHandler.bind(this)
        this.getFinanceByYearHandler = this.getFinanceByYearHandler.bind(this)
    }

    async postRegisterHandler(req, res, next) {
        try {
            const { nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan } = req.body
            this._validator.validateAddRegisterPayload(req.body)
            const id = await this._service.register(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan)

            await this._sendWhatsappMessage(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan)

            const response = {
                error: false,
                status: 201,
                message: 'Success',
                data: {
                    id
                }
            }
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getAllRegisterHandler(req, res, next) {
        try {
            const { page = 1, limit = 10, startDate, endDate } = req.query
            this._validator.validateGetAllRegisterPayload(req.query)
            const { result, total, totalPage, nextPage, prevPage } = await this._service.getAllRegister(page, limit, startDate, endDate)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result,
                pagination: {
                    total,
                    totalPage,
                    nextPage,
                    prevPage,
                    page: parseInt(page),
                    limit: parseInt(limit),
                }
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getRegisterByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            const result = await this._service.getRegisterById(id)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: {
                    result
                }
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async deleteRegisterByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            await this._service.deleteRegisterById(id)
            const response = {
                error: false,
                status: 200,
                message: 'Success'
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async updateRegisterByIdHandler(req, res, next) {
        try {
            const { id } = req.params
            const { nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total } = req.body
            this._validator.validatePutRegisterPayload(req.body)
            await this._service.updateRegisterById(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total)
            const response = {
                error: false,
                status: 200,
                message: 'Success'
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async postCompleteRegisterHandler(req, res, next) {
        try {
            const { nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total } = req.body
            this._validator.validatePutRegisterPayload(req.body)
            const id = await this._service.insertCompleteRegister(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, diagnosa, tindakan, obat, total)
            const response = {
                error: false,
                status: 201,
                message: 'Success',
                data: {
                    id
                }
            }
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getRegisterByNikHandler(req, res, next) {
        try {
            const { nik } = req.params
            const result = await this._service.getPatientByNik(nik)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getFinanceByYearHandler(req, res, next) {
        try {
            const { year } = req.params
            const result = await this._service.getFinanceByYear(year)
            const response = {
                error: false,
                status: 200,
                message: 'Success',
                data: result
            }
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async _sendWhatsappMessage(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan) {
        const jenisKelamin = jk === 'L' ? 'Laki-laki' : 'Perempuan'
        const message = `*🦷 Rumah Dental Gama - Pendaftaran Berhasil ✅*\n\n` +
            `Halo *${nama}*,\n` +
            `Terima kasih telah melakukan pendaftaran di *Rumah Dental Gama*.\n\n` +
            `📅 *Tanggal Daftar:* ${tanggalDaftar}\n\n` +
            `📌 *Data Anda:*\n` +
            `• NIK: ${nik}\n` +
            `• No. HP: ${nohp}\n` +
            `• Jenis Kelamin: ${jenisKelamin}\n` +
            `• Tanggal Lahir: ${tglLahir}\n` +
            `• Alamat: ${alamat}\n` +
            `• Keluhan: ${keluhan}\n\n` +
            `🔗 *Detail Pendaftaran:*\n` +
            `https://${process.env.HOST}/register/${id}\n\n` +
            `🙏 *Mohon datang tepat waktu sesuai jadwal. Kami tunggu kehadiran Anda di Rumah Dental Gama.*`

        try {
            await this._axios.post('https://api.fonnte.com/send/', { target: nohp, message: message },
                {
                    headers: {
                        Authorization: process.env.WHATSAPP_TOKEN
                    }
                }
            )
        } catch (error) {
            console.error('Error sending WhatsApp message:', error)
        }
    }
}

module.exports = RegisterHandler