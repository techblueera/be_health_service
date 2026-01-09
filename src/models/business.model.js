import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["HOSPITAL", "CLINIC", "LAB", "PHARMACY"],
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    locations: [
      {
        pincode: {
          type: String,
          required: true,
          index: true,
        },
        city: String,
        state: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

businessSchema.index({ name: 1, type: 1 });

export default mongoose.model("Business", businessSchema);
