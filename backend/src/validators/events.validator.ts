import Joi from 'joi';

export const eventValidators = {
    create: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        date: Joi.string().isoDate().optional(),
        event_date: Joi.string().isoDate().optional(),
        eventDate: Joi.string().isoDate().optional(),
        location: Joi.string().optional(),
        tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional()
    }).or('date', 'event_date', 'eventDate'),

    update: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        date: Joi.string().isoDate().optional(),
        event_date: Joi.string().isoDate().optional(),
        eventDate: Joi.string().isoDate().optional(),
        location: Joi.string().optional(),
        tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional()
    })
};
