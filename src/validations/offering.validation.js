import mongoose from "mongoose";
import Joi from "joi";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const objectIdSchema = Joi.string().custom(objectId, "ObjectId validation");


export const createOfferingSchema = Joi.object({
  businessId: objectIdSchema.required(),
  moduleId: objectIdSchema.required(),
  catalogNodeId: objectIdSchema.required(),
  name: Joi.string().trim().min(2).max(150).required(),
  type: Joi.string()
    .valid("PRODUCT", "SERVICE", "PACKAGE", "PROFESSIONAL", "FACILITY")
    .required(),
  description: Joi.string().allow("").optional(),
  pricing: Joi.object({
    basePrice: Joi.number().positive().required(),
    discountedPrice: Joi.number().positive().optional(),
    currency: Joi.string().default("INR"),
  }).required(),
  availability: Joi.object({
    days: Joi.array().items(Joi.string()).optional(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    appointmentRequired: Joi.boolean().optional(),
  }).optional(),
  medicalRules: Joi.object({
    prescriptionRequired: Joi.boolean().optional(),
    fastingRequired: Joi.boolean().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateOfferingSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  description: Joi.string().allow("").optional(),
  pricing: Joi.object({
    basePrice: Joi.number().positive().required(),
    discountedPrice: Joi.number().positive().optional(),
    currency: Joi.string().optional(),
  }).optional(),
  availability: Joi.object({
    days: Joi.array().items(Joi.string()).optional(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    appointmentRequired: Joi.boolean().optional(),
  }).optional(),
  medicalRules: Joi.object({
    prescriptionRequired: Joi.boolean().optional(),
    fastingRequired: Joi.boolean().optional(),
  }).optional(),
  image: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1) // at least one field must be updated
  .unknown(false);

export const offeringIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});

