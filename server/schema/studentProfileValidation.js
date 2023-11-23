import Joi from 'joi';

const studentProfileSchema = Joi.object({
  lrn: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('', null), // Optional
  nameExtension: Joi.string().allow('', null), // Optional
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().integer().required(),
  schoolYear: Joi.string().required(),
  grade: Joi.string().required(),
  section: Joi.string().required(),
  is4p: Joi.boolean().required(),
  parentName1: Joi.string().required(),
  parentContact1: Joi.string().required(),
  parentName2: Joi.string().allow('', null), // Optional
  parentContact2: Joi.string().allow('', null), // Optional
  address: Joi.string().required(),
});

export const validateStudentProfile = (data) => {
  return studentProfileSchema.validate(data);
};
