import Joi from 'joi';

const ValidationSchema = Joi.object({
  itemId: Joi.string().required(),
  batchId: Joi.string().required(),
  type: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  reason: Joi.string().required(),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});
export const validateAdjustment = (data) => {
  return ValidationSchema.validate(data);
};

