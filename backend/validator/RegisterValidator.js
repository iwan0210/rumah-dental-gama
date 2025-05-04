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
            'any.required': 'Tanggal lahir wajib diisi.'
        }),
        tanggalDaftar: Joi.date().iso().required().messages({
            'date.base': 'Tanggal lahir harus berupa tanggal yang valid.',
            'any.required': 'Tanggal lahir wajib diisi.'
        }),
        keluhan: Joi.string().required().messages({
            'string.base': 'Keluhan harus berupa teks.',
            'any.required': 'Keluhan wajib diisi.'
        })
    }),
}

const RegisterValidator = {
    validateAddRegisterPayload: payload => {
        const validationResult = RegisterSchema.addRegister.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = RegisterValidator