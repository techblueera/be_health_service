import Joi from "joi";
import mongoose from "mongoose";

export const objectIdSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "Mongo ObjectId validation");

export const createInventorySchema = Joi.object({
  offeringId: objectIdSchema.required(),
  pincode: Joi.number().integer().min(100000).max(999999).required(),
  stock: Joi.number().integer().min(0).required(),
  unit: Joi.string().trim().min(1).max(50).required(),
});

export const inventoryIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});

export const updateInventorySchema = Joi.object({
  stock: Joi.number().integer().min(0).optional(),
  unit: Joi.string().trim().min(1).max(50).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1) 
  .unknown(false);

export const offeringInventoryParamSchema = Joi.object({
  offeringId: objectIdSchema.required(),
});

export const searchInventorySchema = Joi.object({
  pincode: Joi.number().integer().min(100000).max(999999).required(),
  catalogNodeId: objectIdSchema.optional(),
  moduleId: objectIdSchema.optional(),
});

export const toggleInventoryParamSchema = Joi.object({
  id: objectIdSchema.required(),
});
