import { Schema, model } from "mongoose";

const productVariantSchema = new Schema({
  businessId: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  weight: String, // "600 gm"
  quantity: String, // "100GM"
  mrp: Number,
  sellingPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

export const ProductVariant = model("ProductVariant", productVariantSchema);
