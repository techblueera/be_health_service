import Joi from 'joi';
import mongoose from 'mongoose';

/**
 * ObjectId validator
 */
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

/**
 * Allowed catalog node types
 */
const catalogNodeType = Joi.string().valid(
  'CATEGORY',
  'GROUP',
  'SUBGROUP',
  'LEAF'
);

/**
 * CREATE CatalogNode
 */
export const createCatalogNodeSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    key: Joi.string()
      .uppercase()
      .trim()
      .min(2)
      .max(100)
      .required(),

    type: catalogNodeType.required(),

    description: Joi.string().trim().max(500).optional(),
    moduleId: objectId.optional().required(),
    parentId: objectId.optional().allow(null, ''),
    order: Joi.number().integer().min(0).optional(),
    rules: Joi.object({
      allowChildren: Joi.boolean().optional(),
      allowOfferings: Joi.boolean().optional(),
      prescriptionRequired: Joi.boolean().optional(),
      visibilityRestrictions: Joi.array()
        .items(Joi.string().trim())
        .optional(),
    }).optional(),

    ui: Joi.object({
      icon: Joi.string().trim().optional(),
      layout: Joi.string().valid('list', 'grid', 'card').optional(),
    }).optional(),

    isActive: Joi.boolean().optional(),
  }),
};

/**
 * GET children
 */
export const getCatalogNodeChildrenSchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

/**
 * GET catalog tree
 */
export const getCatalogTreeSchema = {
  query: Joi.object({
    moduleId: objectId.required(),
  }),
};

/** UPDATE CatalogNode
 */
export const updateCatalogNodeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),

  description: Joi.string().allow("").optional(),

  rules: Joi.object({
    allowChildren: Joi.boolean().optional(),
    allowOfferings: Joi.boolean().optional(),
    prescriptionRequired: Joi.boolean().optional(),
    visibilityRestrictions: Joi.array().items(Joi.string()).optional(),
  }).optional(),

  order: Joi.number().integer().min(0).optional(),

  isActive: Joi.boolean().optional(),
})
  .min(1)
  .unknown(false);