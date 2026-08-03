import Joi from 'joi';

export const sessionValidators = {
    create: Joi.object({
        title: Joi.string().optional(),

        date: Joi.string().isoDate().optional(),
        session_date: Joi.string().isoDate().optional(),
        sessionDate: Joi.string().isoDate().optional(),

        start_time: Joi.string().optional(),
        startTime: Joi.string().optional(),

        end_time: Joi.string().optional(),
        endTime: Joi.string().optional(),

        location: Joi.string().optional(),
        notes: Joi.string().optional(),
        status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),

        rsvp_enabled: Joi.boolean().optional(),
        rsvpEnabled: Joi.boolean().optional(),

        userId: Joi.string().optional()
    }).or('date', 'session_date', 'sessionDate'),

    update: Joi.object({
        title: Joi.string().optional(),

        date: Joi.string().isoDate().optional(),
        session_date: Joi.string().isoDate().optional(),
        sessionDate: Joi.string().isoDate().optional(),

        start_time: Joi.string().optional(),
        startTime: Joi.string().optional(),

        end_time: Joi.string().optional(),
        endTime: Joi.string().optional(),

        location: Joi.string().optional(),
        notes: Joi.string().optional(),
        status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),

        rsvp_enabled: Joi.boolean().optional(),
        rsvpEnabled: Joi.boolean().optional()
    })
};
