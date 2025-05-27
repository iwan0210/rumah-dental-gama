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
    }),
    addUserPayloadSchema: Joi.object({
        user: Joi.string().required().messages({
            'string.base': 'Username harus berupa teks.',
            'any.required': 'Username wajib diisi.'
        }),
        name: Joi.string().required().messages({
            'string.base': 'Nama harus berupa teks.',
            'any.required': 'Nama wajib diisi.'
        }),
        password: Joi.string().required().messages({
            'string.base': 'Password harus berupa teks.',
            'any.required': 'Password wajib diisi.'
        }),
        role: Joi.string().valid('admin', 'pendaftaran', 'operator').default('pendaftaran').messages({
            'string.base': 'Role harus berupa teks.',
            'any.only': 'Role harus salah satu dari admin atau pendaftaran.'
        })
    }),
    updateUserPayloadSchema: Joi.object({
        user: Joi.string().required().messages({
            'string.base': 'Username harus berupa teks.',
            'any.required': 'Username wajib diisi.'
        }),
        name: Joi.string().required().messages({
            'string.base': 'Nama harus berupa teks.',
            'any.required': 'Nama wajib diisi.'
        }),
        role: Joi.string().valid('admin', 'pendaftaran', 'operator').default('pendaftaran').messages({
            'string.base': 'Role harus berupa teks.',
            'any.only': 'Role harus salah satu dari admin atau pendaftaran.'
        }),
        password: Joi.string().optional().allow('').messages({
            'string.base': 'Password harus berupa teks.'
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
    },
    validateAddUserPayload: payload => {
        const validationResult = UsersSchema.addUserPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateUpdateUserPayload: payload => {
        const validationResult = UsersSchema.updateUserPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = UsersValidator