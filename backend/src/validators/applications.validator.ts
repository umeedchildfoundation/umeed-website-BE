import Joi from 'joi';

export const applicationValidators = {
    submit: Joi.object({
        full_name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        age: Joi.number().integer().optional(),
        gender: Joi.string().optional(),
        address: Joi.string().optional(),
        occupation: Joi.string().optional(),
        availability: Joi.string().optional(),
        motivation: Joi.string().optional(),
        skills_subjects: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        preferred_languages: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        status: Joi.string().valid('pending', 'reviewed', 'approved', 'rejected').optional()
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid('pending', 'reviewed', 'approved', 'rejected').required()
    })
};
