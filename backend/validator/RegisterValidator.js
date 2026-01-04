const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const RegisterSchema = {
    addRegister: Joi.object({
        nama: Joi.string().required().messages({
            'string.base': 'Nama harus berupa teks.',
            'any.required': 'Nama wajib diisi.'
        }),
        nik: Joi.string().pattern(/^\d{16}$/).required().messages({
            'string.base': 'NIK harus berupa angka.',
            'string.pattern.base': 'NIK harus terdiri dari 16 angka.',
            'any.required': 'NIK wajib diisi.'
        }),
        nohp: Joi.string().pattern(/^08[0-9]{8,11}$/).required().messages({
            'string.base': 'Nomor HP harus berupa teks.',
            'string.pattern.base': 'Nomor HP harus dimulai dengan 08 dan terdiri dari 10–13 digit angka.',
            'any.required': 'Nomor HP wajib diisi.'
        }),
        alamat: Joi.string().required().messages({
            'string.base': 'Alamat harus berupa teks.',
            'any.required': 'Alamat wajib diisi.'
        }),
        jk: Joi.string().valid('L', 'P').required().messages({
            'string.base': 'Jenis kelamin harus berupa teks.',
            'any.only': 'Jenis kelamin hanya dapat berupa "L" atau "P".',
            'any.required': 'Jenis kelamin wajib diisi.'
        }),
        tglLahir: Joi.date().iso().required().messages({
            'date.base': 'Tanggal lahir harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal lahir wajib diisi.'
        }),
        tanggalDaftar: Joi.date().iso().required().messages({
            'date.base': 'Tanggal harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal wajib diisi.'
        }),
        keluhan: Joi.string().required().messages({
            'string.base': 'Keluhan harus berupa teks.',
            'any.required': 'Keluhan wajib diisi.'
        })
    }),
    getAllRegister: Joi.object({
        page: Joi.number().integer().min(1).default(1).messages({
            'number.base': 'Halaman harus berupa angka.',
            'number.integer': 'Halaman harus berupa angka bulat.',
            'number.min': 'Halaman minimal 1.'
        }),
        limit: Joi.number().integer().min(1).default(10).messages({
            'number.base': 'Limit harus berupa angka.',
            'number.integer': 'Limit harus berupa angka bulat.',
            'number.min': 'Limit minimal 1.'
        }),
        startDate: Joi.date().iso().required().messages({
            'date.base': 'Tanggal mulai harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal mulai wajib diisi.'
        }),
        endDate: Joi.date().iso().required().messages({
            'date.base': 'Tanggal akhir harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal akhir wajib diisi.'
        })
    }),
    putRegister: Joi.object({
        nama: Joi.string().required().messages({
            'string.base': 'Nama harus berupa teks.',
            'any.required': 'Nama wajib diisi.'
        }),
        nik: Joi.string().pattern(/^\d{16}$/).required().messages({
            'string.base': 'NIK harus berupa angka.',
            'string.pattern.base': 'NIK harus terdiri dari 16 angka.',
            'any.required': 'NIK wajib diisi.'
        }),
        nohp: Joi.string().pattern(/^08[0-9]{8,11}$/).required().messages({
            'string.base': 'Nomor HP harus berupa teks.',
            'string.pattern.base': 'Nomor HP harus dimulai dengan 08 dan terdiri dari 10–13 digit angka.',
            'any.required': 'Nomor HP wajib diisi.'
        }),
        alamat: Joi.string().required().messages({
            'string.base': 'Alamat harus berupa teks.',
            'any.required': 'Alamat wajib diisi.'
        }),
        jk: Joi.string().valid('L', 'P').required().messages({
            'string.base': 'Jenis kelamin harus berupa teks.',
            'any.only': 'Jenis kelamin hanya dapat berupa "L" atau "P".',
            'any.required': 'Jenis kelamin wajib diisi.'
        }),
        tglLahir: Joi.date().iso().required().messages({
            'date.base': 'Tanggal lahir harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal lahir wajib diisi.'
        }),
        tanggalDaftar: Joi.date().iso().required().messages({
            'date.base': 'Tanggal lahir harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal lahir wajib diisi.'
        }),
        keluhan: Joi.string().required().messages({
            'string.base': 'Keluhan harus berupa teks.',
            'any.required': 'Keluhan wajib diisi.'
        }),
        diagnosa: Joi.string().required().messages({
            'string.base': 'Diagnosa harus berupa teks.',
            'any.required': 'Diagnosa wajib diisi.'
        }),
        tindakan: Joi.string().required().messages({
            'string.base': 'Tindakan harus berupa teks.',
            'any.required': 'Tindakan wajib diisi.'
        }),
        obat: Joi.string().required().messages({
            'string.base': 'Obat harus berupa teks.',
            'any.required': 'Obat wajib diisi.'
        }),
        total: Joi.number().required().messages({
            'number.base': 'Total harus berupa angka.',
            'any.required': 'Total wajib diisi.'
        })
    })
}

const RegisterValidator = {
    validateAddRegisterPayload: payload => {
        const validationResult = RegisterSchema.addRegister.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateGetAllRegisterPayload: payload => {
        const validationResult = RegisterSchema.getAllRegister.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validatePutRegisterPayload: payload => {
        const validationResult = RegisterSchema.putRegister.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = RegisterValidator