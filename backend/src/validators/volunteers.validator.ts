import Joi from 'joi';

export const volunteerValidators = {
    create: Joi.object({
        name: Joi.string().optional(),
        full_name: Joi.string().optional(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),

        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),

        age: Joi.number().integer().optional(),
        gender: Joi.string().optional(),
        
        address: Joi.string().optional(),
        occupation: Joi.string().optional(),

        skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        interests: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),

        availability: Joi.string().optional(),
        motivation: Joi.string().optional(),
        
        status: Joi.string().valid('pending', 'approved', 'rejected', 'inactive').optional(),
        
        user_id: Joi.string().uuid().optional(),
        userId: Joi.string().uuid().optional(),
        
        notes: Joi.string().optional()
    }).or('name', 'full_name', 'firstName'),

    update: Joi.object({
        name: Joi.string().optional(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().email().optional(),
        phoneNumber: Joi.string().optional(),
        age: Joi.number().integer().optional(),
        gender: Joi.string().optional(),
        address: Joi.string().optional(),
        occupation: Joi.string().optional(),
        skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        interests: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        availability: Joi.string().optional(),
        motivation: Joi.string().optional(),
        status: Joi.string().valid('pending', 'approved', 'rejected', 'inactive').optional(),
        notes: Joi.string().optional()
    })
};
