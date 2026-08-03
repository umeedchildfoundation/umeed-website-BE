import Joi from 'joi';

export const contactValidators = {
    submit: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        message: Joi.string().required()
    }),

    updateStatus: Joi.object({
        is_read: Joi.boolean().required()
    })
};
