import Joi from 'joi';

export const noticeValidators = {
    create: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        date: Joi.string().isoDate().optional(),
        attachmentUrl: Joi.string().uri().optional(),
        visibility: Joi.string().valid('public', 'internal').optional()
    }),

    update: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        date: Joi.string().isoDate().optional(),
        attachmentUrl: Joi.string().uri().optional(),
        visibility: Joi.string().valid('public', 'internal').optional()
    })
};
