import { Schema, model } from "mongoose";

const productSchema = new Schema({
  businessId: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  name: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export const Product = model("Product", productSchema);
