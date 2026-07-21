import Joi from 'joi';

const documentSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    url: Joi.string().max(2000).optional(),
    type: Joi.string().max(50).optional()
});

export const volunteerValidators = {
    create: Joi.object({
        name: Joi.string().trim().min(2).max(150).optional(),
        full_name: Joi.string().trim().min(2).max(150).optional(),
        firstName: Joi.string().trim().min(2).max(100).optional(),
        lastName: Joi.string().trim().min(1).max(100).optional(),

        email: Joi.string().trim().email().max(150).required(),
        phone: Joi.string().trim().pattern(/^[0-9]{10}$/).message('"phone" must be exactly 10 digits').optional(),
        phoneNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).message('"phoneNumber" must be exactly 10 digits').optional(),

        age: Joi.number().integer().min(1).max(120).required(),
        gender: Joi.string().trim().min(1).max(30).required(),

        address: Joi.string().trim().min(1).max(500).required(),
        occupation: Joi.string().trim().min(1).max(150).required(),

        skills: Joi.alternatives().try(Joi.string().min(1), Joi.array().items(Joi.string()).min(1)).required(),
        interests: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),

        preferred_languages: Joi.alternatives().try(Joi.string().min(1), Joi.array().items(Joi.string()).min(1)).optional(),
        preferredLanguages: Joi.alternatives().try(Joi.string().min(1), Joi.array().items(Joi.string()).min(1)).optional(),

        availability: Joi.string().trim().min(1).max(100).required(),
        motivation: Joi.string().trim().max(1000).allow('').optional(),

        status: Joi.string().valid('pending', 'approved', 'rejected', 'inactive').optional(),

        user_id: Joi.string().uuid().optional(),
        userId: Joi.string().uuid().optional(),

        volunteer_id: Joi.string().trim().max(50).optional(),
        volunteerId: Joi.string().trim().max(50).optional(),

        documents: Joi.array().items(documentSchema).optional(),
        profile_picture: Joi.string().trim().max(2000).allow('', null).optional(),
        profilePicture: Joi.string().trim().max(2000).allow('', null).optional(),
        joined_at: Joi.string().trim().optional(),

        notes: Joi.string().trim().max(1000).allow('').optional()
    }).or('name', 'full_name', 'firstName').or('phone', 'phoneNumber').or('preferred_languages', 'preferredLanguages'),

    update: Joi.object({
        name: Joi.string().trim().min(2).max(150).optional(),
        firstName: Joi.string().trim().min(2).max(100).optional(),
        lastName: Joi.string().trim().min(1).max(100).optional(),
        email: Joi.string().trim().email().max(150).optional(),
        phone: Joi.string().trim().pattern(/^[0-9]{10}$/).message('"phone" must be exactly 10 digits').allow('').optional(),
        phoneNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).message('"phoneNumber" must be exactly 10 digits').allow('').optional(),
        age: Joi.number().integer().min(1).max(120).allow(null).optional(),
        gender: Joi.string().trim().max(30).allow('').optional(),
        address: Joi.string().trim().max(500).allow('').optional(),
        occupation: Joi.string().trim().max(150).allow('').optional(),
        skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        interests: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        preferred_languages: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        preferredLanguages: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        availability: Joi.string().trim().max(100).allow('').optional(),
        motivation: Joi.string().trim().max(1000).allow('').optional(),
        status: Joi.string().valid('pending', 'approved', 'rejected', 'inactive').optional(),
        volunteer_id: Joi.string().trim().max(50).optional(),
        volunteerId: Joi.string().trim().max(50).optional(),
        documents: Joi.array().items(documentSchema).optional(),
        profile_picture: Joi.string().trim().max(2000).allow('', null).optional(),
        profilePicture: Joi.string().trim().max(2000).allow('', null).optional(),
        notes: Joi.string().trim().max(1000).allow('').optional()
    })
};
