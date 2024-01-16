import Joi from 'joi';

const ValidationSchema = Joi.object({
  type: Joi.string().required(),
  name: Joi.string().required(),
  patientId: Joi.string().allow('', null),
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().integer().required(),
  schoolYear: Joi.string().required(),
  grade: Joi.string().allow('', null),
  section: Joi.string().allow('', null),
  issueDate: Joi.date().required(),
  mobileNumber: Joi.string().required(),
  address: Joi.string().required(),
  medicine: Joi.string().allow('', null),
  quantity: Joi.number().required(),
  malady: Joi.string().required(),
  reason: Joi.string().required(),
  remarks: Joi.string().allow('', null),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});
export const validate = (data) => {
  return ValidationSchema.validate(data);
};
