import Joi from 'joi';

export const authValidators = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        fullName: Joi.string().optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    }),

    updateMe: Joi.object({
        fullName: Joi.string().optional(),
        avatarUrl: Joi.string().uri().optional(),
        userMetadata: Joi.object().optional(),
        preferences: Joi.object().optional()
    })
};
