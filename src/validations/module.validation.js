import Joi from 'joi';
import mongoose from 'mongoose';

/**
 * Custom ObjectId validator
 */
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

/**
 * Shared config schema
 */
const moduleConfigSchema = Joi.object({
  allowsInventory: Joi.boolean(),
  allowsPrescription: Joi.boolean(),
  allowsAppointments: Joi.boolean(),
  allowsPackages: Joi.boolean(),
}).min(1);

/**
 * CREATE module
 */
export const createModuleSchema = {
  body: Joi.object({
    code: Joi.string()
      .uppercase()
      .trim()
      .min(2)
      .max(20)
      .required(),

    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    description: Joi.string()
      .trim()
      .max(500)
      .optional(),

    enabled: Joi.boolean().optional(), // mapped to isActive

    config: moduleConfigSchema.optional(),
  }),
};

/**
 * UPDATE module
 */
export const updateModuleSchema = {
  params: Joi.object({
    id: objectId.required(),
  }),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),

    description: Joi.string().trim().max(500).optional(),

    enabled: Joi.boolean().optional(),

    config: moduleConfigSchema.optional(),
  }).min(1), // ❗ must update something
};

/**
 * GET module by id
 */
export const getModuleByIdSchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};
