import Joi from 'joi';

const ValidationSchema = Joi.object({
  itemId: Joi.string().required(),
  batchId: Joi.string().required(),
  receiptId: Joi.string().required(),
  expirationDate: Joi.date().required(),
  quantity: Joi.number().integer().required(),
  notes: Joi.string().allow('', null),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});
export const validateIn = (data) => {
  return ValidationSchema.validate(data);
};

