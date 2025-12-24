import mongoose from "mongoose";

const offeringSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    catalogNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // key: {
    //   type: String,
    //   required: true,
    //   uppercase: true,
    //   trim: true,
    // },

    type: {
      type: String, // PRODUCT | SERVICE | PACKAGE | PROFESSIONAL | FACILITY
      required: true,
    },

    description: String,

    pricing: {
      basePrice: Number,
      discountedPrice: Number,
      currency: {
        type: String,
        default: "INR",
      },
    },

    inventory: {
      stock: Number,
      unit: String,
    },

    availability: {
      days: [String],
      startTime: String,
      endTime: String,
      appointmentRequired: Boolean,
    },

    medicalRules: {
      prescriptionRequired: Boolean,
      fastingRequired: Boolean,
    },

    image: String,

    serviceablePincodes: {
      type: [String],
      index: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Offering", offeringSchema);
