import Joi from 'joi';

const ValidationSchema = Joi.object({
  product: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  dosagePer: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});
export const validateItem = (data) => {
  return ValidationSchema.validate(data);
};
