
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface ValidationOptions {
  allowUnknown?: boolean;
  abortEarly?: boolean;
}

const validate = (schema: Joi.ObjectSchema, options: ValidationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { allowUnknown = false, abortEarly = false } = options;
    
    const { error } = schema.validate(req.body, { 
      abortEarly,
      allowUnknown,
      stripUnknown: !allowUnknown
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      res.status(400).json({ 
        success: false, 
        message: 'Erro de validação', 
        errors 
      });
      return;
    }

    next();
  };
};

export default validate;
