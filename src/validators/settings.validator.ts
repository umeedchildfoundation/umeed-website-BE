import Joi from 'joi';

export const settingsValidators = {
    upsert: Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required()
    })
};
