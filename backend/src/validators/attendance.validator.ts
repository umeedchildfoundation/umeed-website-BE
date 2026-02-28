import Joi from 'joi';

export const attendanceValidators = {
    markStudent: Joi.object({
        sessionId: Joi.string().required(),
        studentId: Joi.string().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
        remark: Joi.string().optional()
    }),

    bulkMarkStudent: Joi.object({
        sessionId: Joi.string().required(),
        attendanceRecords: Joi.array().items(
            Joi.object({
                studentId: Joi.string().required(),
                status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
                remark: Joi.string().optional()
            })
        ).required()
    }),

    markVolunteer: Joi.object({
        sessionId: Joi.string().required(),
        volunteerId: Joi.string().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
        remark: Joi.string().optional()
    }),

    assignVolunteer: Joi.object({
        sessionId: Joi.string().required(),
        volunteerId: Joi.string().required(),
        studentId: Joi.string().required()
    })
};
