import Joi from 'joi';

export const sessionRsvpValidators = {
    upsert: Joi.object({
        session_id: Joi.string().required(),
        volunteer_id: Joi.string().required(),
        status: Joi.string().valid('yes', 'no', 'maybe').optional(),
        response: Joi.string().valid('yes', 'no', 'maybe').optional()
    }).or('status', 'response')
};
