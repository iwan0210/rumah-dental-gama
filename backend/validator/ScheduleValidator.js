const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

const dayNames = [
    'MINGGU',
    'SENIN',
    'SELASA',
    'RABU',
    'KAMIS',
    'JUMAT',
    'SABTU'
]

const ScheduleSchema = {
    insertSchedule: Joi.object({
        dayName: Joi.string()
            .trim()
            .uppercase()
            .valid(...dayNames)
            .required()
            .messages({
                'string.base': 'Nama hari harus berupa teks.',
                'string.empty': 'Nama hari wajib diisi.',
                'any.only': 'Nama hari tidak valid.',
                'any.required': 'Nama hari wajib diisi.'
            }),

        startTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
                'string.empty': 'Jam mulai wajib diisi.',
                'string.pattern.base': 'Format jam mulai harus HH:mm.',
                'any.required': 'Jam mulai wajib diisi.'
            }),

        endTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
                'string.empty': 'Jam selesai wajib diisi.',
                'string.pattern.base': 'Format jam selesai harus HH:mm.',
                'any.required': 'Jam selesai wajib diisi.'
            })
    })
        .custom((value, helpers) => {
            if (value.startTime >= value.endTime) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .messages({
            'any.invalid': 'Jam selesai harus lebih besar dari jam mulai.'
        }),

    updateSchedule: Joi.object({
        dayName: Joi.string()
            .trim()
            .uppercase()
            .valid(...dayNames)
            .required()
            .messages({
                'string.base': 'Nama hari harus berupa teks.',
                'string.empty': 'Nama hari wajib diisi.',
                'any.only': 'Nama hari tidak valid.',
                'any.required': 'Nama hari wajib diisi.'
            }),

        startTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
                'string.empty': 'Jam mulai wajib diisi.',
                'string.pattern.base': 'Format jam mulai harus HH:mm.',
                'any.required': 'Jam mulai wajib diisi.'
            }),

        endTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
                'string.empty': 'Jam selesai wajib diisi.',
                'string.pattern.base': 'Format jam selesai harus HH:mm.',
                'any.required': 'Jam selesai wajib diisi.'
            })
    })
        .custom((value, helpers) => {
            if (value.startTime >= value.endTime) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .messages({
            'any.invalid': 'Jam selesai harus lebih besar dari jam mulai.'
        }),

    updateScheduleStatus: Joi.object({
        status: Joi.number()
            .integer()
            .valid(0, 1)
            .required()
            .messages({
                'number.base': 'Status harus berupa angka.',
                'number.integer': 'Status harus berupa angka bulat.',
                'any.only': 'Status hanya boleh 0 (Inactive) atau 1 (Active).',
                'any.required': 'Status wajib diisi.'
            })
    })
}

const ScheduleValidator = {
    validateInsertSchedulePayload: payload => {
        const validationResult = ScheduleSchema.insertSchedule.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validateUpdateSchedulePayload: payload => {
        const validationResult = ScheduleSchema.updateSchedule.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validateUpdateScheduleStatusPayload: payload => {
        const validationResult = ScheduleSchema.updateScheduleStatus.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = ScheduleValidator