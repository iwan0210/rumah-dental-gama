const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const HolidaySchema = {
    getAllHoliday: Joi.object({
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
        search: Joi.string().optional().allow('')
    }),
    addHoliday: Joi.object({
        tanggal: Joi.date().iso().required().messages({
            'date.base': 'Tanggal harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal wajib diisi.'
        }),
        keterangan: Joi.string().required().messages({
            'string.base': 'Keterangan harus berupa teks.',
            'any.required': 'Keterangan wajib diisi.'
        })
    }),
    editHoliday: Joi.object({
        keterangan: Joi.string().required().messages({
            'string.base': 'Keterangan harus berupa teks.',
            'any.required': 'Keterangan wajib diisi.'
        })
    }),
    paramHoliday: Joi.object({
        date: Joi.date().iso().required().messages({
            'date.base': 'Tanggal harus berupa tanggal yang valid.',
            'date.format': 'Format tanggal harus ISO 8601 (YYYY-MM-DD).',
            'any.required': 'Tanggal wajib diisi.'
        })
    })
}

const HolidayValidator = {
    validateGetAllHolidayPayload: payload => {
        const validationResult = HolidaySchema.getAllHoliday.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateAddHolidayPayload: payload => {
        const validationResult = HolidaySchema.addHoliday.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateEditHolidayPayload: payload => {
        const validationResult = HolidaySchema.editHoliday.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateParamsHolidayPayload: payload => {
        const validationResult = HolidaySchema.paramHoliday.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = HolidayValidator