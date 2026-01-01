import mongoose from "mongoose";
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
    },

    serviceType: {
      type: String,
      enum: ["LAB_TEST", "LAB_PACKAGE", "PROCEDURE", "CONSULTATION"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    labDetails: {
      sampleType: String,
      fastingRequired: Boolean,
      fastingHours: Number,
      tatHours: Number,

      parameters: [
        {
          name: String,
          unit: String,
          referenceRange: String,
        },
      ],
    },

    includedServices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    pricing: [
      {
        pincode: { type: String, required: true, index: true },
        cityName: { type: String, required: true },
        mrp: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        currency: { type: String, default: "INR" },
      },
    ],
  },
  { timestamps: true }
);

serviceSchema.index({ product: 1 });
// SKU and Barcode must be unique within a business
serviceSchema.index({ sku: 1 }, { unique: true, sparse: true });
serviceSchema.index({ barcode: 1 }, { unique: true, sparse: true });

export default mongoose.model("Service", serviceSchema);
