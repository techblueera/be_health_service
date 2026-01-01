import mongoose from "mongoose";

const offeringSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    catalogNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
      index: true,
    },
    tags: [String],
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["PRODUCT", "SERVICE", "PACKAGE", "PROFESSIONAL", "FACILITY"],
      required: true,
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
  },
  { timestamps: true }
);

offeringSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

export default mongoose.model("Offering", offeringSchema);
