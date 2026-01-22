import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  businessId: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  name: String,
  description: String,
  image: String,
  basePrice: Number,
  sellingPrice: Number,
  discountPercent: Number
});

export const Product = model('Product', productSchema);