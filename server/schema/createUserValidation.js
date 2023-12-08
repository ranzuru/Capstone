import Joi from 'joi';

const getUserValidationSchema = (isCreation = true) => {
  const baseSchema = {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    roleName: Joi.string().required(),
  };

  const creationSchema = isCreation
    ? {
        password: Joi.string().required(),
        confirmPassword: Joi.string()
          .valid(Joi.ref('password'))
          .required()
          .messages({ 'any.only': 'Passwords must match' }),
      }
    : {
        password: Joi.string().optional().allow(''), // Allow password to be optional and empty
        confirmPassword: Joi.string().optional().allow(''), // Same for confirmPassword
      };

  return Joi.object({ ...baseSchema, ...creationSchema });
};

export const userValidation = (data, isCreation = true) => {
  const schema = getUserValidationSchema(isCreation);
  return schema.validate(data, { abortEarly: false });
};
