const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const PatientSchema = {
    getPatient: Joi.object({
        id: Joi.string()
            .pattern(/^(\d{6}|\d{16})$/)
            .required()
            .messages({
                'string.pattern.base': 'Nomor Rekam Medis/NIK harus 6 atau 16 digit angka.',
                'string.empty': 'Nomor Rekam Medis/NIK tidak boleh kosong.',
                'any.required': 'Nomor Rekam Medis/NIK wajib diisi.'
            }),
        tglLahir: Joi.date().iso().required().messages({
            'date.base': 'Tanggal lahir harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal lahir wajib diisi.'
        })
    }),
    addPatient: Joi.object({
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
        })
    }),
    searchPatient: Joi.object({
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
        keyword: Joi.string().allow('').trim().messages({
            'string.base': 'Keyword harus berupa teks.'
        })
    })
}

const PatientValidator = {
    validateGetPatientPayload: payload => {
        const validationResult = PatientSchema.getPatient.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateAddPatientPayload: payload => {
        const validationResult = PatientSchema.addPatient.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateSearchPatientPayload: payload => {
        const validationResult = PatientSchema.searchPatient.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = PatientValidator