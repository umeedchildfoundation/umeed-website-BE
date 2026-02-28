import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema | Joi.ArraySchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
        
        if (error) {
            const errorMessage = error.details.map((details) => details.message).join(', ');
            res.status(400).json({ error: errorMessage });
            return;
        }
        
        req[source] = value;
        next();
    };
};
