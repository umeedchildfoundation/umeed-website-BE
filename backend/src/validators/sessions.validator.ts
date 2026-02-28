import Joi from 'joi';

export const sessionValidators = {
    create: Joi.object({
        title: Joi.string().optional(),
        date: Joi.string().isoDate().required(),
        sessionDate: Joi.string().isoDate().optional(),
        startTime: Joi.string().optional(),
        endTime: Joi.string().optional(),
        location: Joi.string().optional(),
        notes: Joi.string().optional(),
        status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
        rsvpEnabled: Joi.boolean().optional(),
        userId: Joi.string().optional()
    }),

    update: Joi.object({
        title: Joi.string().optional(),
        date: Joi.string().isoDate().optional(),
        sessionDate: Joi.string().isoDate().optional(),
        startTime: Joi.string().optional(),
        endTime: Joi.string().optional(),
        location: Joi.string().optional(),
        notes: Joi.string().optional(),
        status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
        rsvpEnabled: Joi.boolean().optional()
    })
};
