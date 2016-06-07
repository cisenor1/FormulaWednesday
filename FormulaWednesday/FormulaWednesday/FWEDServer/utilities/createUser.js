'use strict';

const Joi = require('joi');

const createUserSchema = Joi.object({
  displayName: Joi.string().alphanum().min(2).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  firstName: Joi.string().alphanum(),
  lastName: Joi.string().alphanum()
});

module.exports = createUserSchema;