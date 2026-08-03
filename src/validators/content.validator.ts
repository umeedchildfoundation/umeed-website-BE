import Joi from 'joi';

export const contentValidators = {
    upsert: Joi.object({
        section: Joi.string().required(),
        key: Joi.string().required(),
        value: Joi.string().allow('', null).required(),
        type: Joi.string().valid('text', 'html', 'json', 'image').optional()
    }),

    bulkUpsert: Joi.object({
        items: Joi.array().items(
            Joi.object({
                section: Joi.string().required(),
                key: Joi.string().required(),
                value: Joi.string().allow('', null).required(),
                type: Joi.string().valid('text', 'html', 'json', 'image').optional()
            })
        ).required()
    })
};
