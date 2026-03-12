import Joi from "joi";

export const createGalleryPhotoSchema = Joi.object({
  imageUrls: Joi.array().items(Joi.string().uri()).min(1).required(),
  title: Joi.string().required(),
});

export const updateGalleryPhotoSchema = Joi.object({
  imageUrls: Joi.array().items(Joi.string().uri()).min(1).optional(),
  title: Joi.string().optional(),
});

export const deleteGalleryImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
});
