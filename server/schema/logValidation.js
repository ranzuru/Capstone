import Joi from 'joi';

const ValidationSchema = Joi.object({
  user: Joi.string().required(),
  section: Joi.string().required(),
  action: Joi.string().required(),
  description: Joi.string().required(),
});
export const validateIn = (data) => {
  return ValidationSchema.validate(data);
};

