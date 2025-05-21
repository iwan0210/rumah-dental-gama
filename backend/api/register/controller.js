class RegisterHandler {
    constructor(service, validator, axios, ExcelJS) {
        this._service = service
        this._validator = validator
        this._axios = axios
        this._ExcelJS = ExcelJS

        this.postRegisterHandler = this.postRegisterHandler.bind(this)
        this.getAllRegisterHandler = this.getAllRegisterHandler.bind(this)
        this.getRegisterByIdHandler = this.getRegisterByIdHandler.bind(this)
        this.deleteRegisterByIdHandler = this.deleteRegisterByIdHandler.bind(this)
        this.updateRegisterByIdHandler = this.updateRegisterByIdHandler.bind(this)
        this.postCompleteRegisterHandler = this.postCompleteRegisterHandler.bind(this)
        this.getRegisterByNikHandler = this.getRegisterByNikHandler.bind(this)
        this.getFinanceByYearHandler = this.getFinanceByYearHandler.bind(this)
        this.getAllRegisterByYearMonthHandler = this.getAllRegisterByYearMonthHandler.bind(this)
        this.getExportExcel = this.getExportExcel.bind(this)
        this.getPatientByNameOrNikHandler = this.getPatientByNameOrNikHandler.bind(this)
    }

    async postRegisterHandler(req, res, next) {
        try {
            const { nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan } = req.body
            this._validator.validateAddRegisterPayload(req.body)
            const [id, queueNumber] = await this._service.register(nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan)

            await this._sendWhatsappMessage(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, queueNumber)

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

    async _sendWhatsappMessage(id, nama, nik, nohp, alamat, jk, tglLahir, tanggalDaftar, keluhan, noReg) {
        const age = this.getAge(tglLahir)
        const jenisKelamin = jk === 'L' ? 'Laki-laki' : 'Perempuan'
        const message = `*🦷 Rumah Dental Gama - Pendaftaran Berhasil ✅*\n\n` +
            `Halo *${nama}*,\n` +
            `Terima kasih telah melakukan pendaftaran di *Rumah Dental Gama*.\n\n` +
            `📅 *Tanggal Daftar:* ${tanggalDaftar}\n\n` +
            `🔢 *Nomor Antrian:* ${noReg}\n\n` +
            `📌 *Data Anda:*\n` +
            `• NIK: ${nik}\n` +
            `• No. HP: ${nohp}\n` +
            `• Jenis Kelamin: ${jenisKelamin}\n` +
            `• Tanggal Lahir: ${tglLahir}\n` +
            `• Umur: ${age} tahun\n` +
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

    async getAllRegisterByYearMonthHandler(req, res, next) {
        try {
            let { year, month } = req.query
            const now = new Date()
            year = year || now.getFullYear().toString()
            month = month || (now.getMonth() + 1).toString().padStart(2, '0')
            const result = await this._service.getAllRegisterByYearMonth(year, month)
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

    async getExportExcel(req, res, next) {
        try {
            let { year, month } = req.query
            const now = new Date()
            year = year || now.getFullYear().toString()
            month = month || (now.getMonth() + 1).toString().padStart(2, '0')
            const data = await this._service.getAllRegisterByYearMonth(year, month)

            const workbook = new this._ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Rekap Pasien')

            worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'ID', key: 'id', width: 10 },
            { header: 'No Reg', key: 'no_reg', width: 15 },
            { header: 'Nama', key: 'nama', width: 25 },
            { header: 'NIK', key: 'nik', width: 20 },
            { header: 'JK', key: 'jk', width: 10 },
            { header: 'Tanggal Lahir', key: 'tgl_lahir', width: 20 },
            { header: 'No HP', key: 'nohp', width: 15 },
            { header: 'Alamat', key: 'alamat', width: 30 },
            { header: 'Tanggal', key: 'tanggal', width: 20 },
            { header: 'Keluhan', key: 'keluhan', width: 25 },
            { header: 'Diagnosa', key: 'diagnosa', width: 25 },
            { header: 'Tindakan', key: 'tindakan', width: 25 },
            { header: 'Obat', key: 'obat', width: 25 },
            { header: 'Total', key: 'total', width: 15 },
            ]

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F497D' },
            }
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
            worksheet.getRow(1).height = 20

            data.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                ...item,
            })
            })

            const totalRows = data.length + 1

            for (let i = 1; i <= totalRows; i++) {
            const row = worksheet.getRow(i)
            row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
                left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
                bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
                right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
                }
            })
            }

            const startRow = 2
            const endRow = data.length + 1
            const totalColIndex = 15

            const totalRow = worksheet.addRow([])

            totalRow.getCell(totalColIndex - 1).value = 'Total'
            totalRow.getCell(totalColIndex - 1).font = { bold: true }
            totalRow.getCell(totalColIndex - 1).alignment = { horizontal: 'right' }

            totalRow.getCell(totalColIndex).value = {
            formula: `SUM(O${startRow}:O${endRow})`,
            result: data.reduce((sum, item) => sum + (item.total || 0), 0),
            }
            totalRow.getCell(totalColIndex).font = { bold: true }
            totalRow.getCell(totalColIndex).numFmt = '#,##0'

            totalRow.alignment = { vertical: 'middle' }
            totalRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'double', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
            }
            })

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename="rekap_pasien.xlsx"')

            await workbook.xlsx.write(res)
            res.end()


        } catch (error) {
            next(error)
        }
    }

    getAge(dateString) {
        const birthDate = new Date(dateString)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    async getPatientByNameOrNikHandler(req, res, next) {
        try {
            const { query = "-" } = req.query
            const result = await this._service.getPatientByNameOrNik(query)
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
}

module.exports = RegisterHandler