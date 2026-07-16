const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const QueueSessionSchema = {
    insertQueueSession: Joi.object({
        name: Joi.string()
            .trim()
            .max(50)
            .required()
            .messages({
                'string.base': 'Nama sesi harus berupa teks.',
                'string.empty': 'Nama sesi wajib diisi.',
                'string.max': 'Nama sesi maksimal 50 karakter.',
                'any.required': 'Nama sesi wajib diisi.'
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

    updateQueueSession: Joi.object({
        name: Joi.string()
            .trim()
            .max(50)
            .required()
            .messages({
                'string.base': 'Nama sesi harus berupa teks.',
                'string.empty': 'Nama sesi wajib diisi.',
                'string.max': 'Nama sesi maksimal 50 karakter.',
                'any.required': 'Nama sesi wajib diisi.'
            }),

        startTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
                'string.pattern.base': 'Format jam mulai harus HH:mm.',
                'any.required': 'Jam mulai wajib diisi.'
            }),

        endTime: Joi.string()
            .pattern(timePattern)
            .required()
            .messages({
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

    updateStatusQueueSession: Joi.object({
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

const QueueSessionValidator = {
    validateInsertQueueSessionPayload: payload => {
        const validationResult = QueueSessionSchema.insertQueueSession.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validateUpdateQueueSessionPayload: payload => {
        const validationResult = QueueSessionSchema.updateQueueSession.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validateUpdateStatusQueueSessionPayload: payload => {
        const validationResult = QueueSessionSchema.updateStatusQueueSession.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = QueueSessionValidator