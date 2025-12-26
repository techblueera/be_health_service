import mongoose from "mongoose";

const offeringSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    moduleId: {
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
    },

    type: {
      type: String,
      enum: ["PRODUCT", "SERVICE", "PACKAGE", "PROFESSIONAL", "FACILITY"],
      required: true,
    },

    description: String,

    pricing: {
      basePrice: { type: Number, required: true },
      discountedPrice: Number,
      currency: { type: String, default: "INR" },
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

offeringSchema.index(
  { businessId: 1, catalogNodeId: 1, name: 1 },
  { unique: true }
);

export default mongoose.model("Offering", offeringSchema);
