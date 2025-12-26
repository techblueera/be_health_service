import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    offeringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offering",
      required: true,
      index: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    catalogNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
      index: true,
    },

    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    pincode: {
      type: Number,
      required: true,
      index: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

inventorySchema.index(
  {
    offeringId: 1,
    businessId: 1,
    catalogNodeId: 1,
    pincode: 1,
  },
  { unique: true }
);

export default mongoose.model("Inventory", inventorySchema);
