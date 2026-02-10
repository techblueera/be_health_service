// import { Schema, model } from "mongoose";

// const inventorySchema = new Schema(
//   {
//     businessId: { type: String, required: true },
//     productVariantId: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductVariant",
//       required: true,
//     },
//     pincode: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     cityName: {
//       type: String,
//       required: true,
//     },
//     batches: [
//       {
//         batchNumber: { type: String, default: "N/A" },
//         quantity: { type: Number, min: 0 },
//         mfgDate: { type: Date },
//         expiryDate: { type: Date },
//         mrp: { type: Number, required: true },
//         sellingPrice: { type: Number, required: true },
//       },
//     ],
//     supplierInfo: {
//       name: String,
//       contact: String,
//     },
//     location: {
//       aisle: String,
//       shelf: String,
//     },
//     reorderPoint: {
//       type: Number,
//       default: 10,
//     },
//   },
//   { timestamps: true }
// );

// export default model("Inventory", inventorySchema);
