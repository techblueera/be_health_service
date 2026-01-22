import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  businessId: { type: String, required: true },
  name: String, // "OTC Items", "Herbal/Ayurved"
  icon: String
});

export const Category = model('Category', categorySchema);
