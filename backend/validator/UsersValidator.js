const Joi = require('joi')
const InvariantError = require('../exceptions/InvariantError')

const UsersSchema = {
    loginPayloadSchema: Joi.object({
        user: Joi.string().required().messages({
            'string.base': 'Username harus berupa teks.',
            'any.required': 'Username wajib diisi.'
        }),
        password: Joi.string().required().messages({
            'string.base': 'Password harus berupa teks.',
            'any.required': 'Password wajib diisi.'
        })
    }),
    changePasswordPayloadSchema: Joi.object({
        oldPassword: Joi.string().required().messages({
            'string.base': 'Password lama harus berupa teks.',
            'any.required': 'Password lama wajib diisi.'
        }),
        newPassword: Joi.string().required().messages({
            'string.base': 'Password baru harus berupa teks.',
            'any.required': 'Password baru wajib diisi.'
        })
    })
}

const UsersValidator = {
    validateLoginPayload: payload => {
        const validationResult = UsersSchema.loginPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateChangePasswordPayload: payload => {
        const validationResult = UsersSchema.changePasswordPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = UsersValidator