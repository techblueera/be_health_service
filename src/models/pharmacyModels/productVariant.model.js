// import { Schema, model } from "mongoose";

// const productVariantSchema = new Schema(
//   {
//     businessId: { type: String, required: true },
//     productId: { type: Schema.Types.ObjectId, ref: "Product" },
//     images: [
//       {
//         url: { type: String, required: true },
//         altText: { type: String },
//       },
//     ],
//     weight: Number, // "600 gm",
//     inventories: [{
//         pincode: {
//           type: String,
//           required: true,
//         },
//         cityName: {
//           type: String,
//           required: true,
//         },
//         batches: [
//           {
//             batchNumber: { type: String, default: "N/A" },
//             quantity: { type: Number, min: 0 },
//             mfgDate: { type: Date },
//             expiryDate: { type: Date },
//             mrp: { type: Number, required: true },
//             sellingPrice: { type: Number, required: true },
//           },
//         ],
//         supplierInfo: {
//           name: String,
//           contact: String,
//         },
//         location: {
//           aisle: String,
//           shelf: String,
//         },
//         reorderPoint: {
//           type: Number,
//           default: 10,
//         },
//     }]
//   },
//   { timestamps: true }
// );

// export default model("ProductVariant", productVariantSchema);